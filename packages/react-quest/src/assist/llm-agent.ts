import type { AgentResponse, AssistContext, LLMAgentConfig } from "./types";

/**
 * LLM-based agent using server-side API endpoint.
 * Falls back to rule-based agent if the API is not available.
 */
export async function runLLMAgent(
	input: string,
	context: AssistContext,
	config: LLMAgentConfig,
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
					currentRoute: context.currentRoute,
					assistState: context.assistState,
					lastError: context.lastError
						? {
								error: {
									message: context.lastError.error.message,
								},
								meta: context.lastError.meta,
								timestamp: context.lastError.timestamp,
							}
						: null,
					markers: context.markers,
				},
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
		const { runAgent } = await import("./agent");
		return runAgent(input, context);
	}
}

