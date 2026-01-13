import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { createLLM } from "./llm-provider.js";
import {
	createDefaultToolRegistry,
	type ToolRegistry,
} from "./tool-registry.js";
import type {
	AgentRequest,
	AgentResponse,
	ServerConfig,
	ToolCall,
} from "./types.js";

/**
 * Format context for the LLM prompt
 */
function formatContextForPrompt(context: AgentRequest["context"]): string {
	const parts: string[] = [];

	if (context.route) {
		parts.push(`Current route: ${context.route}`);
	}

	if (context.error) {
		const error = context.error.error;
		parts.push(
			`\n! Last error: ${error.message}${context.error.meta?.markerId ? ` (related to marker: ${context.error.meta.markerId})` : ""}`,
		);
		parts.push(
			"The user may want to retry the failed action. Look for markers related to the error.",
		);
	}

	if (context.state && Object.keys(context.state).length > 0) {
		parts.push(`\nApplication state: ${JSON.stringify(context.state)}`);
	}

	if (context.markers.length > 0) {
		parts.push("\nAvailable UI elements (markers):");
		for (const marker of context.markers) {
			const isInView = context.inViewMarkerIds?.includes(marker.id) ?? false;
			const inViewStatus = isInView ? " [IN VIEW]" : "";
			let markerLine = `  - ${marker.label} (ID: ${marker.id}, Type: ${marker.elementType})${inViewStatus}: ${marker.intent}`;

			// Add value for input/textarea elements
			if (marker.value !== undefined) {
				markerLine += `\n    Current value: "${marker.value}"`;
			}

			// Add options and selected values for select elements
			if (marker.options !== undefined) {
				const optionsList = marker.options
					.map((opt) => `${opt.label} (${opt.value})`)
					.join(", ");
				markerLine += `\n    Available options: ${optionsList}`;
			}
			if (
				marker.selectedOptions !== undefined &&
				marker.selectedOptions.length > 0
			) {
				markerLine += `\n    Selected: ${marker.selectedOptions.join(", ")}`;
			}

			parts.push(markerLine);
		}
	} else {
		parts.push("\nNo UI elements are currently available.");
	}

	if (context.inViewMarkerIds && context.inViewMarkerIds.length > 0) {
		parts.push(`\nVisible markers: ${context.inViewMarkerIds.join(", ")}`);
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
		for (const [key, param] of Object.entries(
			def.parameters.properties,
		) as Array<[string, { type: string; description: string }]>) {
			const zodType =
				param.type === "string"
					? z.string()
					: param.type === "number"
						? z.number()
						: param.type === "boolean"
							? z.boolean()
							: z.unknown();
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
 * Check if user input matches any marker and return matching marker info
 * Also checks if user is referring to a UI element (button, link, etc.) vs just a route
 */
function findMatchingMarker(
	input: string,
	markers: AgentRequest["context"]["markers"],
): {
	marker: AgentRequest["context"]["markers"][0];
	searchText: string;
	isElementReference: boolean;
} | null {
	const lowerInput = input.toLowerCase().trim();

	// Check if input contains navigation language
	const hasNavigationLanguage =
		lowerInput.includes("go to") ||
		lowerInput.includes("navigate to") ||
		lowerInput.includes("open") ||
		lowerInput.includes("take me to");

	if (!hasNavigationLanguage) {
		return null;
	}

	// Check if user is referring to a UI element (button, link, nav button, etc.)
	const elementKeywords = [
		"button",
		"link",
		"nav button",
		"navigation button",
		"nav link",
		"navigation link",
		"element",
		"item",
		"tab",
	];
	const isElementReference = elementKeywords.some((keyword) =>
		lowerInput.includes(keyword),
	);

	// Extract search text by removing navigation keywords
	const searchText = lowerInput
		.replace(/go to|navigate to|open|take me to/g, "")
		.trim();

	// Find matching marker
	const matchingMarker = markers.find((m) => {
		const markerText = `${m.label} ${m.intent}`.toLowerCase();
		return (
			markerText.includes(searchText) ||
			lowerInput.includes(m.label.toLowerCase()) ||
			lowerInput.includes(m.intent.toLowerCase())
		);
	});

	return matchingMarker
		? { marker: matchingMarker, searchText, isElementReference }
		: null;
}

/**
 * LangChain response with tool calls
 */
interface LangChainResponseWithTools {
	tool_calls?: Array<{
		name?: string;
		args?: Record<string, unknown>;
		function?: {
			name?: string;
			arguments?: string | Record<string, unknown>;
		};
	}>;
	additional_kwargs?: {
		tool_calls?: Array<{
			name?: string;
			args?: Record<string, unknown>;
			function?: {
				name?: string;
				arguments?: string | Record<string, unknown>;
			};
		}>;
	};
}

/**
 * Type guard to check if response has tool calls
 */
function hasToolCalls(
	response: unknown,
): response is LangChainResponseWithTools {
	return (
		typeof response === "object" &&
		response !== null &&
		("tool_calls" in response ||
			("additional_kwargs" in response &&
				typeof (response as LangChainResponseWithTools).additional_kwargs ===
					"object" &&
				(response as LangChainResponseWithTools).additional_kwargs !== null &&
				"tool_calls" in
					(response as LangChainResponseWithTools).additional_kwargs!))
	);
}

/**
 * Run the LLM agent on the server
 */
export async function runAgent(
	request: AgentRequest,
	config: ServerConfig,
	toolRegistry: ToolRegistry = createDefaultToolRegistry(),
): Promise<AgentResponse> {
	// Create LLM instance
	const llm = await createLLM(config);

	// Check if user input matches a marker (for scroll vs navigate decision)
	const markerMatch = findMatchingMarker(
		request.input,
		request.context.markers,
	);

	// Format context for the prompt
	const contextPrompt = formatContextForPrompt(request.context);

	// Convert tool registry to LangChain tools
	const langchainTools = createLangChainTools(toolRegistry, request.context);

	// Bind tools to LLM
	const llmWithTools =
		langchainTools.length > 0 && typeof llm.bindTools === "function"
			? llm.bindTools(langchainTools)
			: llm;

	// Extract marker info from recent conversation if available
	let recentMarkerContext = "";
	if (request.messages && request.messages.length > 0) {
		const lastFewMessages = request.messages.slice(-4);
		for (const msg of lastFewMessages) {
			// Look for marker mentions in the conversation
			for (const marker of request.context.markers) {
				if (
					msg.content.toLowerCase().includes(marker.label.toLowerCase()) ||
					msg.content.toLowerCase().includes(marker.id.toLowerCase())
				) {
					recentMarkerContext += `\nRecently discussed: ${marker.label} (${marker.id}) - ${marker.intent}`;
					break;
				}
			}
		}
	}

	// Add marker match guidance if found
	let markerMatchGuidance = "";
	if (markerMatch) {
		const marker = markerMatch.marker;
		const isInView =
			request.context.inViewMarkerIds?.includes(marker.id) ?? false;
		const isLink = marker.elementType === "a";

		if (isLink && isInView) {
			markerMatchGuidance = `\n\n⚠️ Match found: "${marker.label}" (${marker.id}) is a visible link. Use 'click' tool.`;
		} else if (isLink && !isInView) {
			markerMatchGuidance = `\n\n🚨 Match found: "${marker.label}" (${marker.id}) is a link NOT in view. DO NOT use 'click' - use 'scroll' tool instead.`;
		} else if (!isInView) {
			markerMatchGuidance = `\n\n🚨 Match found: "${marker.label}" (${marker.id}) is NOT in view. DO NOT use 'click' - use 'scroll' tool instead.`;
		} else {
			markerMatchGuidance = `\n\nMatch found: "${marker.label}" (${marker.id}) is an element. Use 'scroll' tool.`;
		}
	}

	const systemPrompt = `You are a helpful AI agent embedded in a web application. Help users navigate, interact with UI elements, and resolve errors.

${contextPrompt}${recentMarkerContext}${markerMatchGuidance}

Navigation rules:
- "navigate to [element]" = scroll to that element (use 'scroll' tool)
- "navigate to [route]" = route navigation (use 'navigate' tool with route path)
- CRITICAL: Check inViewMarkerIds before using 'click'. NEVER use 'click' if markerId is NOT in inViewMarkerIds - use 'scroll' instead.
- If marker matches and is in inViewMarkerIds + elementType='a' → use 'click'
- If marker matches but NOT in inViewMarkerIds → use 'scroll' (DO NOT use 'click')
- If no marker matches → use 'navigate' with route path
- For affirmative responses after discussing a marker, interact with that marker using the appropriate tool.

Relative scrolling rules (for "scroll to next" or "scroll to previous"):
- Markers are listed in document order (top to bottom) in the markers array
- CRITICAL: Always skip markers that are in inViewMarkerIds - only scroll to markers NOT currently in view
- For "scroll to next": Find the first marker in the markers array that comes after any currently visible markers and is NOT in inViewMarkerIds
- For "scroll to previous": Find the first marker in the markers array that comes before any currently visible markers and is NOT in inViewMarkerIds
- This prevents getting stuck on sections already in view`;

	// Build conversation messages
	const conversationMessages: Array<{ role: string; content: string }> = [
		{ role: "system", content: systemPrompt },
	];

	// Add conversation history if available (excluding the current input)
	if (request.messages && request.messages.length > 0) {
		// Add previous messages (last 10 to avoid token limits)
		const recentMessages = request.messages.slice(-10);
		for (const msg of recentMessages) {
			conversationMessages.push({
				role: msg.role,
				content: msg.content,
			});
		}
	}

	// Add current user input
	conversationMessages.push({ role: "user", content: request.input });

	// Invoke LLM with messages
	const response = await llmWithTools.invoke(conversationMessages);

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
	const toolCallObjects: Array<{
		name?: string;
		args?: Record<string, unknown>;
		function?: {
			name?: string;
			arguments?: string | Record<string, unknown>;
		};
	}> = hasToolCalls(response)
		? response.tool_calls || response.additional_kwargs?.tool_calls || []
		: [];

	for (const toolCall of toolCallObjects) {
		const toolName = toolCall.name || toolCall.function?.name;
		const toolArgs =
			toolCall.args ||
			(toolCall.function?.arguments
				? typeof toolCall.function.arguments === "string"
					? JSON.parse(toolCall.function.arguments)
					: toolCall.function.arguments
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
