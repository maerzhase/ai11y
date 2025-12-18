/**
 * Shared types between client and server
 */

export type ToolCall =
	| { type: "navigate"; route: string }
	| { type: "highlight"; markerId: string }
	| { type: "click"; markerId: string };

export interface AgentResponse {
	reply: string;
	toolCalls?: ToolCall[];
}

export interface AssistContext {
	currentRoute: string;
	assistState: Record<string, unknown>;
	lastError: {
		error: {
			message: string;
		};
		meta?: {
			surface?: string;
			markerId?: string;
		};
		timestamp: number;
	} | null;
	markers: Array<{
		id: string;
		label: string;
		intent: string;
	}>;
}

export interface AgentRequest {
	input: string;
	context: AssistContext;
}

export interface ServerConfig {
	apiKey: string;
	model?: string;
	baseURL?: string;
}

/**
 * Tool definition for extensibility
 */
export interface ToolDefinition {
	name: string;
	description: string;
	parameters: {
		type: "object";
		properties: Record<
			string,
			{
				type: string;
				description: string;
			}
		>;
		required?: string[];
	};
}

/**
 * Tool executor function
 */
export type ToolExecutor = (
	args: Record<string, unknown>,
	context: AssistContext,
) => Promise<unknown> | unknown;

