import {
	clickMarker,
	fillInputMarker,
	runAgentAdapter,
	scrollToMarker,
	type AgentAdapterConfig,
	type LLMAgentConfig,
} from "@ui4ai/core";
import {
	Mark,
	useAssist,
	useAssistChat,
	useAssistTools,
	type ToolCall,
} from "@ui4ai/react";
import { useEffect, useRef, useState } from "react";
import { useDebugDrawer } from "../context/DebugDrawerContext";
import { ThemeToggle } from "./ThemeToggle";

export function ScrollyHero() {
	const { getContext, track, agentConfig } = useAssist();
	const { navigate, highlight } = useAssistTools();
	const { isOpen: isDebugOpen, setIsOpen: setDebugOpen } = useDebugDrawer();
	const [isCompact, setIsCompact] = useState(false);
	const [showMessages, setShowMessages] = useState(false);
	const heroRef = useRef<HTMLElement>(null);

	// Track scroll to switch between full and compact modes
	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			const threshold = window.innerHeight * 0.6;
			setIsCompact(scrollY > threshold);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleSubmit = async (
		message: string,
		messages: Array<{ type: string; content: string }>
	) => {
		const context = getContext();

		const conversationMessages = messages
			.filter((m, index) => {
				if (
					index === messages.length - 1 &&
					m.type === "user" &&
					m.content === message
				) {
					return false;
				}
				return m.type === "user" || m.type === "assistant";
			})
			.map((m) => ({
				role: m.type === "user" ? ("user" as const) : ("assistant" as const),
				content: m.content,
			}));

		const adapterConfig: AgentAdapterConfig = {
			mode: agentConfig?.mode ?? "auto",
			forceRuleBased: agentConfig?.forceRuleBased,
			llmConfig:
				agentConfig?.apiEndpoint !== undefined
					? ({ apiEndpoint: agentConfig.apiEndpoint } as LLMAgentConfig)
					: undefined,
		};

		const response = await runAgentAdapter(
			message,
			context,
			adapterConfig,
			conversationMessages
		);

		track("agent_message", { input: message, response });

		return response;
	};

	const handleToolCall = (toolCall: ToolCall) => {
		switch (toolCall.type) {
			case "navigate":
				if (toolCall.route) {
					navigate(toolCall.route);
				}
				break;
			case "highlight":
				if (toolCall.markerId) {
					highlight(toolCall.markerId);
				}
				break;
			case "scroll":
				if (toolCall.markerId) {
					scrollToMarker(toolCall.markerId);
				}
				break;
			case "click":
				if (toolCall.markerId) {
					clickMarker(toolCall.markerId);
				}
				break;
			case "fillInput":
				if (toolCall.markerId && toolCall.value !== undefined) {
					fillInputMarker(toolCall.markerId, toolCall.value);
				}
				break;
		}
	};

	const {
		messages,
		input,
		setInput,
		isProcessing,
		inputRef,
		handleSubmit: handleChatSubmit,
	} = useAssistChat({
		onSubmit: handleSubmit,
		onToolCall: handleToolCall,
		initialMessage:
			"Welcome! I can help you navigate this page, highlight features, and interact with demos. Try saying 'show me navigation' or scroll down to explore!",
	});

	const messagesContainerRef = useRef<HTMLDivElement>(null);

	// Auto-scroll messages
	useEffect(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop =
				messagesContainerRef.current.scrollHeight;
		}
	}, [messages]);

	// Filter to show only recent messages
	const recentMessages = messages.slice(-4);
	const lastMessage = messages[messages.length - 1];

	const handleSuggestion = (suggestion: string) => {
		setInput(suggestion);
		inputRef.current?.focus();
	};

	return (
		<>
			{/* Fixed Header - appears when scrolled */}
			<header
				className={`fixed top-0 left-0 z-50 transition-all duration-300 ${
					isDebugOpen ? "right-96" : "right-0"
				} ${
					isCompact
						? "opacity-100 translate-y-0"
						: "opacity-0 -translate-y-full pointer-events-none"
				}`}
			>
				<div className="bg-background/80 backdrop-blur-xl">
					<div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
								ui4ai
							</h1>
							<span className="text-xs text-muted-foreground hidden sm:block">
								A semantic UI context layer for AI agents
							</span>
						</div>
						<div className="flex items-center gap-2">
							<Mark
								id="theme_toggle_header"
								label="Theme Toggle"
								intent="Toggle between light and dark theme"
							>
								<ThemeToggle />
							</Mark>
							{!isDebugOpen && (
								<Mark
									id="debug_panel_toggle_header"
									label="Debug Panel Toggle"
									intent="Open the debug panel to view events, markers, and UI context"
								>
									<button
										type="button"
										onClick={() => setDebugOpen(true)}
										className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium shadow-sm"
										aria-label="Open debug panel"
									>
										<svg
											className="h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
										Debug
									</button>
								</Mark>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* Theme toggle and debug button when hero is visible */}
			{!isCompact && (
				<div
					className={`fixed top-0 z-50 p-4 transition-all duration-300 ${
						isDebugOpen ? "right-96" : "right-0"
					} ${
						isCompact ? "opacity-0 pointer-events-none" : "opacity-100"
					}`}
				>
					<div className="flex items-center gap-2">
						<Mark
							id="theme_toggle_hero"
							label="Theme Toggle"
							intent="Toggle between light and dark theme"
						>
							<ThemeToggle />
						</Mark>
						{!isDebugOpen && (
							<Mark
								id="debug_panel_toggle_hero"
								label="Debug Panel Toggle"
								intent="Open the debug panel to view events, markers, and UI context"
							>
								<button
									type="button"
									onClick={() => setDebugOpen(true)}
									className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium shadow-sm"
									aria-label="Open debug panel"
								>
									<svg
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									Debug
								</button>
							</Mark>
						)}
					</div>
				</div>
			)}

			{/* Full Hero Section - Static, not sticky */}
			<section
				ref={heroRef}
				className="min-h-screen flex items-center justify-center relative"
			>
				<div className="relative max-w-2xl w-full mx-auto px-6">
					{/* Glassmorphism container */}
					<div className="relative rounded-3xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden">
						{/* Gradient accent */}
						<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

						<div className="relative p-8">
							{/* Title */}
							<Mark
								id="hero_title"
								label="ui4ai"
								intent="The main hero title - A semantic UI context layer for AI agents"
								showAssistBubble
							>
								<h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent tracking-tight text-center">
									ui4ai
								</h1>
							</Mark>

							<p className="text-lg text-muted-foreground mb-6 text-center max-w-md mx-auto">
								A semantic UI context layer for AI agents
							</p>

							{/* Messages area */}
							<div
								ref={messagesContainerRef}
								className="mb-4 max-h-40 overflow-y-auto scrollbar-thin"
							>
								<div className="space-y-2">
									{recentMessages.map((msg) => (
										<div
											key={msg.id}
											className={`text-sm px-3 py-2 rounded-xl ${
												msg.type === "user"
													? "bg-primary text-primary-foreground ml-8"
													: "bg-muted/60 text-foreground mr-8"
											}`}
										>
											{msg.content}
										</div>
									))}
									{isProcessing && (
										<div className="text-sm px-3 py-2 rounded-xl bg-muted/60 text-muted-foreground mr-8">
											<span className="inline-flex gap-1">
												<span className="animate-bounce">·</span>
												<span className="animate-bounce [animation-delay:0.1s]">
													·
												</span>
												<span className="animate-bounce [animation-delay:0.2s]">
													·
												</span>
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Chat input */}
							<form onSubmit={handleChatSubmit} className="relative">
								<input
									ref={isCompact ? undefined : inputRef}
									type="text"
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder="Ask me anything... try 'scroll to features'"
									disabled={isProcessing}
									className="w-full px-5 py-4 pr-14 text-base rounded-2xl border border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 transition-all"
								/>
								<button
									type="submit"
									disabled={!input.trim() || isProcessing}
									className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-primary text-primary-foreground transition-all ${
										input.trim() && !isProcessing
											? "opacity-100 hover:bg-primary/90 active:scale-95"
											: "opacity-30 cursor-not-allowed"
									}`}
								>
									<svg
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<title>Send</title>
										<line x1="22" y1="2" x2="11" y2="13" />
										<polygon points="22 2 15 22 11 13 2 9 22 2" />
									</svg>
								</button>
							</form>

							{/* Quick suggestions */}
							<div className="mt-4 flex flex-wrap gap-2 justify-center">
								{["highlight title", "scroll to features", "go to billing"].map(
									(suggestion) => (
										<button
											key={suggestion}
											type="button"
											onClick={() => handleSuggestion(suggestion)}
											className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
										>
											{suggestion}
										</button>
									)
								)}
							</div>
						</div>
					</div>

					{/* Scroll indicator */}
					<div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/60">
						<span className="text-xs">Scroll to explore</span>
						<div className="w-5 h-8 rounded-full border-2 border-current flex items-start justify-center p-1">
							<div className="w-1 h-2 bg-current rounded-full animate-bounce" />
						</div>
					</div>
				</div>
			</section>

			{/* Compact Floating Input Bar - Fixed at bottom when scrolled */}
			<div
				className={`fixed bottom-6 z-50 max-w-xl px-4 transition-all duration-300 ${
					isDebugOpen
						? "left-[calc(50%-12rem)] -translate-x-1/2"
						: "left-1/2 -translate-x-1/2"
				} ${
					isCompact
						? "opacity-100 translate-y-0"
						: "opacity-0 translate-y-8 pointer-events-none"
				}`}
			>
				<div className="relative rounded-2xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden">
					{/* Expandable messages panel */}
					<div
						className={`overflow-hidden transition-all duration-300 ${
							showMessages ? "max-h-48" : "max-h-0"
						}`}
					>
						<div className="p-3 border-b border-border/30 max-h-48 overflow-y-auto scrollbar-thin">
							<div className="space-y-2">
								{recentMessages.map((msg) => (
									<div
										key={msg.id}
										className={`text-sm px-3 py-2 rounded-sm ${
											msg.type === "user"
												? "bg-primary text-primary-foreground ml-6"
												: "bg-muted/60 text-foreground mr-6"
										}`}
									>
										{msg.content}
									</div>
								))}
								{isProcessing && (
									<div className="text-sm px-3 py-2 rounded-sm bg-muted/60 text-muted-foreground mr-6">
										<span className="inline-flex gap-1">
											<span className="animate-bounce">·</span>
											<span className="animate-bounce [animation-delay:0.1s]">
												·
											</span>
											<span className="animate-bounce [animation-delay:0.2s]">
												·
											</span>
										</span>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Input row */}
					<form onSubmit={handleChatSubmit} className="flex items-center gap-2 p-2">
						{/* Toggle messages button */}
						<button
							type="button"
							onClick={() => setShowMessages((v) => !v)}
							className={`p-2 rounded-sm transition-colors ${
								showMessages
									? "bg-primary/10 text-primary"
									: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
							}`}
						>
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className={`transition-transform ${showMessages ? "rotate-180" : ""}`}
							>
								<title>Toggle messages</title>
								<polyline points="18 15 12 9 6 15" />
							</svg>
						</button>

						{/* Last message preview (when collapsed) */}
						{!showMessages && lastMessage && (
							<div className="hidden sm:block text-xs text-muted-foreground truncate max-w-32 px-2">
								{lastMessage.content.slice(0, 40)}
								{lastMessage.content.length > 40 ? "..." : ""}
							</div>
						)}

						{/* Input */}
						<input
							ref={isCompact ? inputRef : undefined}
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask anything..."
							disabled={isProcessing}
							className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-border/50 bg-muted/30 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 transition-all"
						/>

						{/* Submit */}
						<button
							type="submit"
							disabled={!input.trim() || isProcessing}
							className={`p-2.5 rounded-xl bg-primary text-primary-foreground transition-all ${
								input.trim() && !isProcessing
									? "opacity-100 hover:bg-primary/90 active:scale-95"
									: "opacity-30 cursor-not-allowed"
							}`}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<title>Send</title>
								<line x1="22" y1="2" x2="11" y2="13" />
								<polygon points="22 2 15 22 11 13 2 9 22 2" />
							</svg>
						</button>
					</form>
				</div>
			</div>
		</>
	);
}
