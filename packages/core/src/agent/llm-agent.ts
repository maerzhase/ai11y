import type { AgentResponse, ConversationMessage } from "../types/agent.js";
import type { UIAIContext } from "../types/context.js";
import type { LLMAgentConfig } from "./types.js";

/**
 * LLM-based agent using server-side API endpoint.
 * Falls back to rule-based agent if the API is not available.
 */
export async function runLLMAgent(
	input: string,
	context: UIAIContext,
	config: LLMAgentConfig,
	messages?: ConversationMessage[],
): Promise<AgentResponse> {
	try {
		const response = await fetch(config.apiEndpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				input,
				context: {
					markers: context.markers,
					...(context.route !== undefined && { route: context.route }),
					...(context.state !== undefined && { state: context.state }),
					...(context.error !== undefined && {
						error: context.error
							? {
									error: {
										message: context.error.error.message,
									},
									meta: context.error.meta,
									timestamp: context.error.timestamp,
								}
							: null,
					}),
				},
				messages: messages?.slice(-10), // Send last 10 messages for context
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`API request failed: ${response.status} ${response.statusText}. ${errorText}`,
			);
		}

		const data: AgentResponse = await response.json();
		return data;
	} catch (error) {
		// If API is not available or there's an error, fall back to rule-based
		console.warn("LLM agent error, falling back to rule-based agent:", error);
		const { runRuleBasedAgent } = await import("./rule-based-agent.js");
		return runRuleBasedAgent(input, context);
	}
}
