import type { AgentResponse, AssistContext, LLMAgentConfig, ToolCall } from "./types";

/**
 * LLM-based agent using OpenAI's API with function calling.
 * Falls back to rule-based agent if OpenAI is not available.
 */
export async function runLLMAgent(
	input: string,
	context: AssistContext,
	config: LLMAgentConfig,
): Promise<AgentResponse> {
	try {
		// Dynamic import to make OpenAI optional
		const { OpenAI } = await import("openai");

		const client = new OpenAI({
			apiKey: config.apiKey,
			baseURL: config.baseURL,
			dangerouslyAllowBrowser: true, // Required for browser usage
		});

		// Format context for the prompt
		const contextPrompt = formatContextForPrompt(context);

		// Define tools (functions) the LLM can call
		const tools = [
			{
				type: "function" as const,
				function: {
					name: "navigate",
					description: "Navigate to a different route/page in the application",
					parameters: {
						type: "object",
						properties: {
							route: {
								type: "string",
								description: "The route to navigate to (e.g., '/billing', '/integrations', '/')",
							},
						},
						required: ["route"],
					},
				},
			},
			{
				type: "function" as const,
				function: {
					name: "click",
					description: "Click a button or interactive element by its marker ID",
					parameters: {
						type: "object",
						properties: {
							markerId: {
								type: "string",
								description: "The ID of the marker to click",
							},
						},
						required: ["markerId"],
					},
				},
			},
			{
				type: "function" as const,
				function: {
					name: "highlight",
					description: "Highlight a UI element by its marker ID to draw the user's attention",
					parameters: {
						type: "object",
						properties: {
							markerId: {
								type: "string",
								description: "The ID of the marker to highlight",
							},
						},
						required: ["markerId"],
					},
				},
			},
		];

		const systemPrompt = `You are a helpful AI assistant embedded in a web application. Your role is to help users navigate the app, interact with UI elements, and resolve errors.

You have access to the following tools:
- navigate: Change the current route/page
- click: Click buttons or interactive elements
- highlight: Visually highlight elements to draw attention

${contextPrompt}

When the user asks you to do something:
1. Use the available markers to understand what actions are possible
2. If there's an error, explain it clearly and suggest how to fix it
3. Use the appropriate tools to perform actions
4. Be conversational and helpful in your responses

Available markers: ${context.markers.map((m) => `${m.label} (${m.id})`).join(", ") || "none"}`;

		const response = await client.chat.completions.create({
			model: config.model || "gpt-4o-mini",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: input },
			],
			tools,
			tool_choice: "auto",
			temperature: 0.7,
		});

		const message = response.choices[0]?.message;

		if (!message) {
			throw new Error("No response from LLM");
		}

		// Extract tool calls
		const toolCalls: ToolCall[] = [];
		if (message.tool_calls) {
			for (const toolCall of message.tool_calls) {
				if (toolCall.type === "function") {
					const functionName = toolCall.function.name;
					const args = JSON.parse(toolCall.function.arguments);

					if (functionName === "navigate") {
						toolCalls.push({ type: "navigate", route: args.route });
					} else if (functionName === "click") {
						toolCalls.push({ type: "click", markerId: args.markerId });
					} else if (functionName === "highlight") {
						toolCalls.push({ type: "highlight", markerId: args.markerId });
					}
				}
			}
		}

		return {
			reply: message.content || "I'm here to help!",
			toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
		};
	} catch (error) {
		// If OpenAI is not available or there's an error, fall back to rule-based
		console.warn("LLM agent error, falling back to rule-based agent:", error);
		const { runAgent } = await import("./agent");
		return runAgent(input, context);
	}
}

function formatContextForPrompt(context: AssistContext): string {
	const parts: string[] = [];

	parts.push(`Current route: ${context.currentRoute}`);

	if (context.lastError) {
		const error = context.lastError.error;
		parts.push(
			`\n⚠️ Last error: ${error.message}${context.lastError.meta?.markerId ? ` (related to marker: ${context.lastError.meta.markerId})` : ""}`,
		);
		parts.push(
			"The user may want to retry the failed action. Look for markers related to the error.",
		);
	}

	if (Object.keys(context.assistState).length > 0) {
		parts.push(`\nApplication state: ${JSON.stringify(context.assistState)}`);
	}

	if (context.markers.length > 0) {
		parts.push("\nAvailable UI elements (markers):");
		for (const marker of context.markers) {
			parts.push(`  - ${marker.label} (ID: ${marker.id}): ${marker.intent}`);
		}
	} else {
		parts.push("\nNo UI elements are currently available.");
	}

	return parts.join("\n");
}

