// Re-export agent functions from core for backwards compatibility
/**
 * @deprecated Use runRuleBasedAgent from @ui4ai/core instead
 */
export {
	type AgentAdapterConfig,
	runAgentAdapter,
	runLLMAgent,
	runRuleBasedAgent,
	runRuleBasedAgent as runAgent,
} from "@ui4ai/core";
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
