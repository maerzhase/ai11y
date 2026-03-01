import { getContext } from "@ai11y/core";
import { useChat } from "@ai11y/react";
import { AssistPanelPopover, ChatInput, MessageBubble } from "@ai11y/ui";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useDemoUi } from "@/context/DemoUiContext";

export function AssistPanel() {
	const { isPanelOpen, setIsPanelOpen, pendingMessage, clearPendingMessage } =
		useDemoUi();
	const [hasNewMessages, setHasNewMessages] = useState(false);
	const lastSeenCountRef = useRef(0);

	const handleSubmit = async (
		_message: string,
		_messages: Array<{ type: string; content: string }>,
	) => {
		const context = getContext(undefined, "markers");

		const contextDescription = `Page: ${context.page?.title || document.title}
URL: ${context.page?.url || window.location.href}
Route: ${context.route}

Markers (${context.markers.length}):
${context.markers.map((m) => `- ${m.id}: ${m.label} (${m.intent || "no intent"})`).join("\n") || "none"}`;

		const reply = `I've analyzed the page. Here's what I found:

${contextDescription}

To interact with this page, I can use these WebMCP tools:
- \`describe\` - Get UI context
- \`click_<id>\` - Click a marked element  
- \`fillInput_<id> { value }\` - Fill an input
- \`highlight_<id>\` - Highlight an element
- \`scroll_<id>\` - Scroll to an element
- \`navigate_<route>\` - Navigate to a route
- \`setState\` - Set application state
- \`getState\` - Get application state

In a real WebMCP setup, AI agents would call these tools directly via the MCP protocol. This demo shows how ai11y exposes your UI as tools.`;

		return { reply };
	};

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const {
		messages,
		input,
		setInput,
		isProcessing,
		handleSubmit: handleChatSubmit,
	} = useChat({
		onSubmit: handleSubmit,
		onMessage: () => {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		},
	});

	useEffect(() => {
		if (isPanelOpen && inputRef.current) {
			inputRef.current.focus();
		}
		if (isPanelOpen) {
			setHasNewMessages(false);
			lastSeenCountRef.current = messages.length;
		}
	}, [isPanelOpen, messages.length]);

	useEffect(() => {
		if (
			!isPanelOpen &&
			messages.length > lastSeenCountRef.current &&
			lastSeenCountRef.current > 0
		) {
			setHasNewMessages(true);
		}
	}, [messages.length, isPanelOpen]);

	useEffect(() => {
		if (!pendingMessage || !isPanelOpen) return;

		setInput(pendingMessage);
		clearPendingMessage();

		const timeout = window.setTimeout(() => {
			inputRef.current?.focus();
		}, 0);

		return () => window.clearTimeout(timeout);
	}, [pendingMessage, isPanelOpen, setInput, clearPendingMessage]);

	return (
		<AssistPanelPopover
			isOpen={isPanelOpen}
			onOpenChange={setIsPanelOpen}
			onClose={() => setIsPanelOpen(false)}
			hasNewMessages={hasNewMessages}
		>
			<div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
				{messages.map((msg, index) => (
					<MessageBubble
						key={msg.id ?? `msg-${index}`}
						message={{
							type: msg.type,
							content: msg.content,
						}}
					/>
				))}
				{isProcessing && (
					<div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground">
						<span className="inline-flex gap-0.5">
							<span className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-pulse" />
							<span className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-pulse [animation-delay:150ms]" />
							<span className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-pulse [animation-delay:300ms]" />
						</span>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
			<ChatInput
				value={input}
				onChange={setInput}
				onSubmit={handleChatSubmit}
				disabled={isProcessing}
				inputRef={inputRef as React.RefObject<HTMLInputElement>}
			/>
		</AssistPanelPopover>
	);
}
