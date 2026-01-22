import type { AgentResponse, ConversationMessage } from "../types/agent.js";
import type { Instruction } from "../types/instruction.js";
import type { UIAIContext } from "../types/context.js";
import { runAgentAdapter } from "./agent-adapter.js";
import type { AgentAdapterConfig } from "./types.js";

/**
 * Plans instructions based on UI context and user input
 *
 * @param ui - The current UI context
 * @param input - User input/command
 * @param config - Optional agent configuration
 * @param messages - Optional conversation history
 * @returns The full agent response containing both reply and instructions
 *
 * @example
 * ```ts
 * const ui = ctx.describe()
 * const response = await plan(ui, "click save button", config)
 * for (const instruction of response.instructions || []) {
 *   ctx.act(instruction)
 * }
 * ```
 */
export async function plan(
	ui: UIAIContext,
	input: string,
	config?: AgentAdapterConfig,
	messages?: ConversationMessage[],
): Promise<AgentResponse> {
	const response: AgentResponse = await runAgentAdapter(
		input,
		ui,
		config,
		messages,
	);

	// Return the full response with both reply and instructions
	return response;
}
