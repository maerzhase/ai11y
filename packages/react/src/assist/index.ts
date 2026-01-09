export { AssistPanel } from "./AssistPanel.js";
export { UIAIProvider, useAssist } from "./AssistProvider.js";
export { Mark } from "./Mark.js";
export type {
	AgentConfig,
	AgentMode,
	AgentResponse,
	LLMAgentConfig,
	Marker,
	ToolCall,
	UIAIContext,
	UIAIError,
	UIAIEvent,
	UIAIState,
} from "./types.js";
export type { Message as ChatMessage } from "./useAssistChat.js";
export { useAssistChat } from "./useAssistChat.js";
export { useAssistTools } from "./useAssistTools.js";

// Re-export agent functions from core for backwards compatibility
export {
	runAgentAdapter,
	runLLMAgent,
	runRuleBasedAgent,
	type AgentAdapterConfig,
} from "@ui4ai/core";

/**
 * @deprecated Use runRuleBasedAgent from @ui4ai/core instead
 */
export { runRuleBasedAgent as runAgent } from "@ui4ai/core";
