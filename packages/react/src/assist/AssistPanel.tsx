import {
	AssistPanelPopover,
	ChatInput,
	MessageList,
} from "@quest/ui";
import { useEffect } from "react";
import { useAssist } from "./AssistProvider";
import { runAgent } from "./agent";
import { runLLMAgent } from "./llm-agent";
import type { ToolCall } from "./types";
import { useAssistChat } from "./useAssistChat";

export function AssistPanel() {
	const {
		isPanelOpen,
		setIsPanelOpen,
		getContext,
		navigate,
		highlight,
		scroll,
		click,
		track,
		llmConfig,
		pendingMessage,
		clearPendingMessage,
	} = useAssist();

	const handleSubmit = async (message: string, messages: Array<{ type: string; content: string }>) => {
		const context = getContext();

		// Convert messages to conversation format for LLM
		// Exclude the last message if it's the current user message (to avoid duplication)
		const conversationMessages = messages
			.filter((m, index) => {
				// Include all messages except the last one if it matches the current input
				if (index === messages.length - 1 && m.type === "user" && m.content === message) {
					return false;
				}
				return m.type === "user" || m.type === "assistant";
			})
			.map((m) => ({
				role: m.type === "user" ? "user" as const : "assistant" as const,
				content: m.content,
			}));

		// Use LLM agent if configured, otherwise use rule-based
		const response = llmConfig
			? await runLLMAgent(message, context, llmConfig, conversationMessages)
			: runAgent(message, context);

		// Track the interaction
		track("assistant_message", { input: message, response });

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
					scroll(toolCall.markerId);
				}
				break;
			case "click":
				if (toolCall.markerId) {
					click(toolCall.markerId);
				}
				break;
		}
	};

	const {
		messages,
		input,
		setInput,
		isProcessing,
		messagesEndRef,
		inputRef,
		handleSubmit: handleChatSubmit,
	} = useAssistChat({
		onSubmit: handleSubmit,
		onToolCall: handleToolCall,
	});

	// Focus input when panel opens
	useEffect(() => {
		if (isPanelOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isPanelOpen, inputRef]);

	// Set pending message when available (works even if the input ref isn't ready yet)
	useEffect(() => {
		if (!pendingMessage || !isPanelOpen) return;

		setInput(pendingMessage);
		clearPendingMessage();

		// Focus on next tick (input may mount after we set input state)
		const timeout = window.setTimeout(() => {
			inputRef.current?.focus();
		}, 0);

		return () => window.clearTimeout(timeout);
	}, [pendingMessage, isPanelOpen, setInput, clearPendingMessage, inputRef]);

	return (
		<AssistPanelPopover isOpen={isPanelOpen} onOpenChange={setIsPanelOpen} onClose={() => setIsPanelOpen(false)}>
			<MessageList
				messages={messages}
				isProcessing={isProcessing}
				messagesEndRef={messagesEndRef}
			/>
			<ChatInput
				autoFocus
				value={input}
				onChange={setInput}
				onSubmit={handleChatSubmit}
				disabled={isProcessing}
				inputRef={inputRef}
			/>
		</AssistPanelPopover>
	);
}
