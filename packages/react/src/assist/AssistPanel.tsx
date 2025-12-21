import { AssistPanel as BaseAssistPanel } from "@quest/ui";
import type { ToolCall } from "./types";
import { useAssist } from "./AssistProvider";
import { runAgent } from "./agent";
import { runLLMAgent } from "./llm-agent";

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

	const handleSubmit = async (message: string) => {
		const context = getContext();

		// Use LLM agent if configured, otherwise use rule-based
		const response = llmConfig
			? await runLLMAgent(message, context, llmConfig)
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
			case "click":
				if (toolCall.markerId) {
					click(toolCall.markerId);
				}
				break;
		}
	};

	return (
		<BaseAssistPanel
			isOpen={isPanelOpen}
			onOpenChange={setIsPanelOpen}
			onSubmit={handleSubmit}
			onToolCall={handleToolCall}
		/>
	);
}

