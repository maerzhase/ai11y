import React, { useEffect, useRef, useState } from "react";
import { useAssist } from "./AssistProvider";
import { runAgent } from "./agent";
import { runLLMAgent } from "./llm-agent";
import type { ToolCall } from "./types";

interface Message {
	id: string;
	type: "user" | "assistant" | "system";
	content: string;
	timestamp: number;
}

export function AssistPanel() {
	const {
		isPanelOpen,
		setIsPanelOpen,
		getContext,
		navigate,
		highlight,
		click,
		track,
		llmConfig,
	} = useAssist();
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "welcome",
			type: "assistant",
			content: "Hi! I'm your AI assistant. I can help you navigate, click buttons, and highlight elements. Try saying 'go to billing' or 'click connect stripe'.",
			timestamp: Date.now(),
		},
	]);
	const [input, setInput] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Focus input when panel opens
	useEffect(() => {
		if (isPanelOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isPanelOpen]);

	const executeToolCall = (toolCall: ToolCall) => {
		switch (toolCall.type) {
			case "navigate":
				navigate(toolCall.route);
				addSystemMessage(`Navigated to ${toolCall.route}`);
				break;
			case "highlight":
				highlight(toolCall.markerId);
				addSystemMessage(`Highlighted ${toolCall.markerId}`);
				break;
			case "click":
				click(toolCall.markerId);
				addSystemMessage(`Clicked ${toolCall.markerId}`);
				break;
		}
	};

	const addSystemMessage = (content: string) => {
		setMessages((prev) => [
			...prev,
			{
				id: `system-${Date.now()}`,
				type: "system",
				content,
				timestamp: Date.now(),
			},
		]);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isProcessing) return;

		const userMessage = input.trim();
		setInput("");
		setIsProcessing(true);

		// Add user message
		const userMsg: Message = {
			id: `user-${Date.now()}`,
			type: "user",
			content: userMessage,
			timestamp: Date.now(),
		};
		setMessages((prev) => [...prev, userMsg]);

		// Get context and run agent
		const context = getContext();
		
		try {
			// Use LLM agent if configured, otherwise use rule-based
			const response = llmConfig
				? await runLLMAgent(userMessage, context, llmConfig)
				: runAgent(userMessage, context);

			// Add assistant reply
			const assistantMsg: Message = {
				id: `assistant-${Date.now()}`,
				type: "assistant",
				content: response.reply,
				timestamp: Date.now(),
			};
			setMessages((prev) => [...prev, assistantMsg]);

			// Execute tool calls
			if (response.toolCalls) {
				for (const toolCall of response.toolCalls) {
					executeToolCall(toolCall);
				}
			}

			track("assistant_message", { input: userMessage, response });
		} catch (error) {
			// Handle errors gracefully
			const errorMsg: Message = {
				id: `error-${Date.now()}`,
				type: "assistant",
				content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
				timestamp: Date.now(),
			};
			setMessages((prev) => [...prev, errorMsg]);
			track("assistant_error", { input: userMessage, error });
		} finally {
			setIsProcessing(false);
		}
	};

	if (!isPanelOpen) {
		return (
			<button
				onClick={() => setIsPanelOpen(true)}
				style={{
					position: "fixed",
					bottom: 20,
					right: 20,
					width: 56,
					height: 56,
					borderRadius: "50%",
					background: "#3b82f6",
					color: "white",
					border: "none",
					cursor: "pointer",
					boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
					fontSize: 24,
					zIndex: 10000,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
				aria-label="Open AI Assistant"
			>
				💬
			</button>
		);
	}

	return (
		<div
			style={{
				position: "fixed",
				bottom: 20,
				right: 20,
				width: 400,
				height: 600,
				maxHeight: "calc(100vh - 40px)",
				background: "white",
				borderRadius: 12,
				boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
				display: "flex",
				flexDirection: "column",
				zIndex: 10000,
				overflow: "hidden",
			}}
		>
			{/* Header */}
			<div
				style={{
					padding: "16px 20px",
					borderBottom: "1px solid #e5e7eb",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					background: "#f9fafb",
				}}
			>
				<h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
					AI Assistant
				</h3>
				<button
					onClick={() => setIsPanelOpen(false)}
					style={{
						background: "none",
						border: "none",
						cursor: "pointer",
						fontSize: 20,
						color: "#6b7280",
						padding: 4,
					}}
					aria-label="Close"
				>
					×
				</button>
			</div>

			{/* Messages */}
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "16px 20px",
					display: "flex",
					flexDirection: "column",
					gap: 12,
				}}
			>
				{messages.map((msg) => (
					<div
						key={msg.id}
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems:
								msg.type === "user" ? "flex-end" : "flex-start",
						}}
					>
						<div
							style={{
								padding: "10px 14px",
								borderRadius: 12,
								maxWidth: "80%",
								background:
									msg.type === "user"
										? "#3b82f6"
										: msg.type === "system"
											? "#f3f4f6"
											: "#f9fafb",
								color:
									msg.type === "user"
										? "white"
										: msg.type === "system"
											? "#6b7280"
											: "#111827",
								fontSize: 14,
								lineHeight: 1.5,
								border:
									msg.type === "system"
										? "1px solid #e5e7eb"
										: "none",
							}}
						>
							{msg.content}
						</div>
					</div>
				))}
				{isProcessing && (
					<div
						style={{
							padding: "10px 14px",
							borderRadius: 12,
							background: "#f9fafb",
							color: "#6b7280",
							fontSize: 14,
						}}
					>
						Thinking...
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<form
				onSubmit={handleSubmit}
				style={{
					padding: "16px 20px",
					borderTop: "1px solid #e5e7eb",
					background: "#f9fafb",
				}}
			>
				<div style={{ display: "flex", gap: 8 }}>
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Ask me anything..."
						disabled={isProcessing}
						style={{
							flex: 1,
							padding: "10px 14px",
							border: "1px solid #e5e7eb",
							borderRadius: 8,
							fontSize: 14,
							outline: "none",
						}}
					/>
					<button
						type="submit"
						disabled={!input.trim() || isProcessing}
						style={{
							padding: "10px 20px",
							background: "#3b82f6",
							color: "white",
							border: "none",
							borderRadius: 8,
							cursor: input.trim() && !isProcessing ? "pointer" : "not-allowed",
							fontSize: 14,
							fontWeight: 500,
							opacity: input.trim() && !isProcessing ? 1 : 0.5,
						}}
					>
						Send
					</button>
				</div>
			</form>
		</div>
	);
}

