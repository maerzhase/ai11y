/**
 * System prompt generation for ai11y agent
 *
 * @module
 * @internal
 */

import type { Ai11yTool, InputSchema } from "@ai11y/core";
import { ai11yTools } from "@ai11y/core";

/**
 * Internal tool input type
 */
type ToolInput = Ai11yTool;

/**
 * Extracts required fields from parameters schema
 */
function getRequiredFields(params: InputSchema): string[] {
	return params.required || [];
}

/**
 * Extracts example values from parameters schema
 */
function getExampleValues(params: InputSchema): Record<string, unknown> {
	const example: Record<string, unknown> = {};
	if (params.properties) {
		for (const [key, prop] of Object.entries(params.properties)) {
			if (prop && typeof prop === "object" && "type" in prop) {
				const propDef = prop as { type: string; enum?: unknown[] };
				if (
					propDef.enum &&
					Array.isArray(propDef.enum) &&
					propDef.enum.length > 0
				) {
					example[key] = propDef.enum[0];
				} else if (propDef.type === "string") {
					example[key] = `example_${key}`;
				} else if (propDef.type === "number" || propDef.type === "integer") {
					example[key] = 1;
				} else if (propDef.type === "boolean") {
					example[key] = true;
				} else {
					example[key] = null;
				}
			}
		}
	}
	return example;
}

/**
 * Generates a system prompt for the ai11y agent
 *
 * @param tools - Optional custom tool list (uses default ai11y tools if not provided)
 * @returns Formatted system prompt string
 *
 * @example
 * ```typescript
 * import { generateSystemPrompt } from "./lib/prompt";
 *
 * const prompt = generateSystemPrompt();
 * // Returns a system prompt with tool definitions
 * ```
 *
 * @remarks
 * The generated prompt includes:
 * - List of available tools with descriptions
 * - Parameter requirements for each tool
 * - Guidelines for the LLM
 * - Example response format
 */
export function generateSystemPrompt(tools?: ToolInput[]): string {
	const toolList = (tools || ai11yTools)
		.map((tool) => `- ${tool.name}: ${tool.description}`)
		.join("\n");

	const toolParamExamples = (tools || ai11yTools).map((tool) => {
		const actionName = tool.name.replace("ai11y_", "");
		const requiredFields = getRequiredFields(tool.parameters);
		const exampleValues = getExampleValues(tool.parameters);
		return JSON.stringify({ action: actionName, ...exampleValues });
	});

	const exampleInstructions = toolParamExamples
		.slice(0, 2)
		.map((ex) => JSON.parse(ex));

	return `You are an AI assistant helping a user interact with a web page. The page has been analyzed and its UI elements are available as tools.

Available tools:
${toolList}

Your job is to return a JSON array of instructions that the client will execute.
Each instruction must have an "action" field plus appropriate parameters based on the tool.

Guidelines:
1. Analyze what the user wants to accomplish
2. Return the sequence of instructions needed (as array JSON)
3. Each instruction must have: action + appropriate fields
4. Include a brief reply explaining what you're doing
5. If no action needed, return empty array []

Example response format:
{
  "instructions": ${JSON.stringify(exampleInstructions)},
  "reply": "I'll help you with that."
}`;
}
