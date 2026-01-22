import type { UIAIContext } from "./context.js";

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
	context: UIAIContext,
) => Promise<unknown> | unknown;
