import { openAITools } from "@ai11y/core";

export function generateSystemPrompt(): string {
	const toolList = openAITools
		.map((tool) => `- ${tool.name}: ${tool.description}`)
		.join("\n");

	const toolsWithActions = openAITools.filter((t) => t.actionFormat);

	const instructionFormats = toolsWithActions
		.map((tool) => {
			const format = tool.actionFormat;
			if (!format) return null;
			const instruction = { action: format.action, ...format.example };
			return JSON.stringify(instruction);
		})
		.filter(Boolean)
		.join("\n");

	const exampleInstructions = toolsWithActions
		.slice(0, 2)
		.map((tool) => {
			const format = tool.actionFormat;
			if (!format) return null;
			return { action: format.action, ...format.example };
		})
		.filter(Boolean);

	return `You are an AI assistant helping a user interact with a web page. The page has been analyzed and its UI elements are available as tools.

Available tools:
${toolList}

Your job is to return a JSON array of instructions that the client will execute.
Each instruction must match one of these formats:
${instructionFormats}

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
