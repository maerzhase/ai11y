import type { UIAIContext } from "./context.js";
import type { ToolCall } from "./tool.js";

/**
 * Response from the agent containing a reply and optional tool calls
 */
export interface AgentResponse {
	reply: string;
	toolCalls?: ToolCall[];
}

/**
 * Conversation message for context
 */
export interface ConversationMessage {
	role: "user" | "assistant";
	content: string;
}

/**
 * Request to the agent containing user input and current context
 */
export interface AgentRequest {
	input: string;
	context: UIAIContext;
	/**
	 * Optional conversation history for context-aware responses
	 */
	messages?: ConversationMessage[];
}
