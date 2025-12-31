import type { UIContext } from "./context";

/**
 * Tool call types that the agent can execute
 */
export type ToolCall =
	| { type: "navigate"; route: string }
	| { type: "highlight"; markerId: string }
	| { type: "click"; markerId: string }
	| { type: "scroll"; markerId: string };

/**
 * Tool definition for extensibility
 * Defines a tool that can be registered and executed by the agent
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
 * Executes a tool call with the given arguments and context
 */
export type ToolExecutor = (
	args: Record<string, unknown>,
	context: UIContext,
) => Promise<unknown> | unknown;
