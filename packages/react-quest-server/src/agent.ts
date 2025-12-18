import { OpenAI } from "openai";
import type { AgentRequest, AgentResponse, ServerConfig, ToolCall } from "./types";
import { ToolRegistry, createDefaultToolRegistry } from "./tool-registry";

/**
 * Format context for the LLM prompt
 */
function formatContextForPrompt(context: AgentRequest["context"]): string {
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

/**
 * Run the LLM agent on the server
 */
export async function runAgent(
	request: AgentRequest,
	config: ServerConfig,
	toolRegistry: ToolRegistry = createDefaultToolRegistry(),
): Promise<AgentResponse> {
	const client = new OpenAI({
		apiKey: config.apiKey,
		baseURL: config.baseURL,
	});

	// Format context for the prompt
	const contextPrompt = formatContextForPrompt(request.context);

	// Get tool definitions from registry
	const tools = toolRegistry.getToolDefinitions();

	const systemPrompt = `You are a helpful AI assistant embedded in a web application. Your role is to help users navigate the app, interact with UI elements, and resolve errors.

You have access to the following tools:
${tools.map((t) => `- ${t.function.name}: ${t.function.description}`).join("\n")}

${contextPrompt}

When the user asks you to do something:
1. Use the available markers to understand what actions are possible
2. If there's an error, explain it clearly and suggest how to fix it
3. Use the appropriate tools to perform actions
4. Be conversational and helpful in your responses

Available markers: ${request.context.markers.map((m) => `${m.label} (${m.id})`).join(", ") || "none"}`;

	const response = await client.chat.completions.create({
		model: config.model || "gpt-4o-mini",
		messages: [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: request.input },
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
				// Try to convert to our ToolCall format
				const converted = toolRegistry.convertToolCall(toolCall);
				if (converted) {
					toolCalls.push(converted);
				} else {
					// For custom tools, execute them and potentially add to toolCalls
					// This allows custom tools to return ToolCall-like objects
					try {
						const args = JSON.parse(toolCall.function.arguments);
						const result = await toolRegistry.executeToolCall(
							toolCall.function.name,
							args,
							request.context,
						);
						// If the result is a ToolCall, add it
						if (result && typeof result === "object" && "type" in result) {
							toolCalls.push(result as ToolCall);
						}
					} catch (error) {
						console.error(`Error executing tool ${toolCall.function.name}:`, error);
					}
				}
			}
		}
	}

	return {
		reply: message.content || "I'm here to help!",
		toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
	};
}

