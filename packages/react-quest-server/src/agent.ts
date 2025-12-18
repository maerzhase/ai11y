import type { AgentRequest, AgentResponse, ServerConfig, ToolCall } from "./types";
import { ToolRegistry, createDefaultToolRegistry } from "./tool-registry";
import { createLLM, normalizeConfig } from "./llm-provider";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

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
 * Convert tool registry to LangChain tools
 */
function createLangChainTools(
	toolRegistry: ToolRegistry,
	context: AgentRequest["context"],
): DynamicStructuredTool[] {
	const tools: DynamicStructuredTool[] = [];
	const toolDefinitions = toolRegistry.getToolDefinitions();

	for (const toolDef of toolDefinitions) {
		const def = toolDef.function;
		
		// Convert parameters to Zod schema
		const zodSchema: Record<string, z.ZodTypeAny> = {};
		for (const [key, param] of Object.entries(def.parameters.properties)) {
			const zodType = param.type === "string" 
				? z.string()
				: param.type === "number"
				? z.number()
				: param.type === "boolean"
				? z.boolean()
				: z.any();
			zodSchema[key] = zodType.describe(param.description);
		}

		const schema = z.object(zodSchema);

		// Create LangChain tool
		const tool = new DynamicStructuredTool({
			name: def.name,
			description: def.description,
			schema,
			func: async (args: Record<string, unknown>) => {
				// Execute the tool via registry
				const result = await toolRegistry.executeToolCall(
					def.name,
					args,
					context,
				);
				return JSON.stringify(result);
			},
		});

		tools.push(tool);
	}

	return tools;
}

/**
 * Run the LLM agent on the server
 */
export async function runAgent(
	request: AgentRequest,
	config: ServerConfig | { apiKey: string; model?: string; baseURL?: string },
	toolRegistry: ToolRegistry = createDefaultToolRegistry(),
): Promise<AgentResponse> {
	// Normalize config to support both new and legacy formats
	const normalizedConfig = normalizeConfig(config);

	// Create LLM instance
	const llm = await createLLM(normalizedConfig);

	// Format context for the prompt
	const contextPrompt = formatContextForPrompt(request.context);

	// Convert tool registry to LangChain tools
	const langchainTools = createLangChainTools(toolRegistry, request.context);

	// Bind tools to LLM
	const llmWithTools = langchainTools.length > 0 
		? llm.bindTools(langchainTools)
		: llm;

	const systemPrompt = `You are a helpful AI assistant embedded in a web application. Your role is to help users navigate the app, interact with UI elements, and resolve errors.

${contextPrompt}

When the user asks you to do something:
1. Use the available markers to understand what actions are possible
2. If there's an error, explain it clearly and suggest how to fix it
3. Use the appropriate tools to perform actions
4. Be conversational and helpful in your responses

Available markers: ${request.context.markers.map((m) => `${m.label} (${m.id})`).join(", ") || "none"}`;

	// Invoke LLM with messages
	const response = await llmWithTools.invoke([
		{ role: "system", content: systemPrompt },
		{ role: "user", content: request.input },
	]);

	// Extract tool calls and content
	const toolCalls: ToolCall[] = [];
	let reply = "";

	// Handle response content
	if (response.content) {
		if (typeof response.content === "string") {
			reply = response.content;
		} else if (Array.isArray(response.content)) {
			// Handle array of content blocks
			reply = response.content
				.map((c) => {
					if (typeof c === "string") return c;
					if (c && typeof c === "object" && "text" in c) return c.text;
					return "";
				})
				.join("");
		} else {
			reply = String(response.content);
		}
	}

	// Extract tool calls from LangChain response
	// LangChain stores tool calls in response.tool_calls or response.additional_kwargs.tool_calls
	const toolCallObjects = 
		(response as any).tool_calls || 
		(response as any).additional_kwargs?.tool_calls || 
		[];
	
	for (const toolCall of toolCallObjects) {
		const toolName = toolCall.name || toolCall.function?.name;
		const toolArgs = toolCall.args || 
			(toolCall.function?.arguments 
				? (typeof toolCall.function.arguments === "string"
					? JSON.parse(toolCall.function.arguments)
					: toolCall.function.arguments)
				: {});

		if (toolName) {
			// Try to convert to our ToolCall format
			const converted = toolRegistry.convertToolCall({
				type: "function",
				function: {
					name: toolName,
					arguments: JSON.stringify(toolArgs),
				},
			});
			
			if (converted) {
				toolCalls.push(converted);
			} else {
				// For custom tools, execute them
				try {
					const result = await toolRegistry.executeToolCall(
						toolName,
						toolArgs,
						request.context,
					);
					// If the result is a ToolCall, add it
					if (result && typeof result === "object" && "type" in result) {
						toolCalls.push(result as ToolCall);
					}
				} catch (error) {
					console.error(`Error executing tool ${toolName}:`, error);
				}
			}
		}
	}

	return {
		reply: reply || "I'm here to help!",
		toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
	};
}

