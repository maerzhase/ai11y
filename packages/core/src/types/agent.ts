import type { AssistContext } from "./context";
import type { ToolCall } from "./tool";

/**
 * Response from the agent containing a reply and optional tool calls
 */
export interface AgentResponse {
	reply: string;
	toolCalls?: ToolCall[];
}

/**
 * Request to the agent containing user input and current context
 */
export interface AgentRequest {
	input: string;
	context: AssistContext;
}
