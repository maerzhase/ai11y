import {
	type AgentAdapterConfig,
	type LLMAgentConfig,
	plan,
} from "@ai11y/core";
import { AssistPanelPopover, ChatInput, MessageList } from "@ai11y/ui";
import { useEffect } from "react";
import { useAi11yContext } from "../hooks/useAi11yContext.js";
import { useChat } from "../hooks/useChat.js";

export function Panel() {
	const {
		isPanelOpen,
		setIsPanelOpen,
		describe,
		act,
		track,
		agentConfig,
		pendingMessage,
		clearPendingMessage,
		addHighlight,
	} = useAi11yContext();

	const handleSubmit = async (
		message: string,
		messages: Array<{ type: string; content: string }>,
	) => {
		const ui = describe();

		// Convert messages to conversation format for LLM
		const conversationMessages = messages
			.filter((m, index) => {
				// Include all messages except the last one if it matches the current input
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

		// Convert AgentConfig to AgentAdapterConfig format
		const adapterConfig: AgentAdapterConfig = {
			mode: agentConfig?.mode ?? "auto",
			forceRuleBased: agentConfig?.forceRuleBased,
			llmConfig:
				agentConfig?.apiEndpoint !== undefined
					? ({ apiEndpoint: agentConfig.apiEndpoint } as LLMAgentConfig)
					: undefined,
		};

		const response = await plan(
			ui,
			message,
			adapterConfig,
			conversationMessages,
		);

		// Track the interaction
		track("agent_message", {
			input: message,
			instructions: response.instructions,
		});

		// Return response for useChat - use the agent's actual reply
		return {
			reply: response.reply,
			instructions:
				response.instructions && response.instructions.length > 0
					? response.instructions
					: undefined,
		};
	};

	const handleInstruction = (
		instruction: import("@ai11y/core").Instruction,
	) => {
		act(instruction);

		// Add highlight for visual feedback only for highlight actions
		// Note: highlightMarker already scrolls into view, so we don't need to add highlight for scroll actions
		if (instruction.action === "highlight") {
			addHighlight(instruction.id);
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
	} = useChat({
		onSubmit: handleSubmit,
		onInstruction: handleInstruction,
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
		<AssistPanelPopover
			isOpen={isPanelOpen}
			onOpenChange={setIsPanelOpen}
			onClose={() => setIsPanelOpen(false)}
		>
			<MessageList
				messages={messages}
				isProcessing={isProcessing}
				messagesEndRef={messagesEndRef}
			/>
			<ChatInput
				value={input}
				onChange={setInput}
				onSubmit={handleChatSubmit}
				disabled={isProcessing}
				inputRef={inputRef}
			/>
		</AssistPanelPopover>
	);
}
