import {
	type AgentAdapterConfig,
	type LLMAgentConfig,
	plan,
} from "@ai11y/core";
import { useAi11yContext, useChat } from "@ai11y/react";
import { AssistPanelPopover, ChatInput, MessageList } from "@ai11y/ui";
import { useEffect } from "react";
import { useDemoUi } from "../context/DemoUiContext";

export function AssistPanel() {
	const { describe, act, track, agentConfig } = useAi11yContext();
	const {
		isPanelOpen,
		setIsPanelOpen,
		pendingMessage,
		clearPendingMessage,
		addHighlight,
	} = useDemoUi();

	const handleSubmit = async (
		message: string,
		messages: Array<{ type: string; content: string }>,
	) => {
		const ui = describe();

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

		const response = await plan(
			ui,
			message,
			adapterConfig,
			conversationMessages,
		);

		track("agent_message", {
			input: message,
			instructions: response.instructions,
		});

		return {
			reply: response.reply,
			instructions:
				response.instructions && response.instructions.length > 0
					? response.instructions
					: undefined,
		};
	};

	const handleInstruction = (instruction: import("@ai11y/core").Instruction) => {
		act(instruction);
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

	useEffect(() => {
		if (isPanelOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isPanelOpen, inputRef]);

	useEffect(() => {
		if (!pendingMessage || !isPanelOpen) return;

		setInput(pendingMessage);
		clearPendingMessage();

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
