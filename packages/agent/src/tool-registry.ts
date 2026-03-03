import type {
	Ai11yContext,
	Ai11yTool,
	Instruction,
	ToolDefinition,
	ToolExecutor,
} from "@ai11y/core";
import { ai11yTools } from "@ai11y/core";

/**
 * Registry for managing tools that can be called by the LLM agent.
 * This allows extending the agent with custom tools.
 */
export class ToolRegistry {
	private tools = new Map<
		string,
		{ definition: ToolDefinition; executor: ToolExecutor }
	>();

	/**
	 * Register a new tool
	 * @returns this for method chaining
	 */
	register(definition: ToolDefinition, executor: ToolExecutor): this {
		if (this.tools.has(definition.name)) {
			throw new Error(`Tool "${definition.name}" is already registered`);
		}
		this.tools.set(definition.name, { definition, executor });
		return this;
	}

	/**
	 * Unregister a tool
	 */
	unregister(name: string): void {
		this.tools.delete(name);
	}

	/**
	 * Get all registered tool definitions for OpenAI function calling
	 */
	getToolDefinitions(): Array<{
		type: "function";
		function: ToolDefinition;
	}> {
		return Array.from(this.tools.values()).map(({ definition }) => ({
			type: "function" as const,
			function: definition,
		}));
	}

	/**
	 * Execute a tool call
	 */
	async executeToolCall(
		toolName: string,
		args: Record<string, unknown>,
		context: Ai11yContext,
	): Promise<unknown> {
		const tool = this.tools.get(toolName);
		if (!tool) {
			throw new Error(`Tool "${toolName}" is not registered`);
		}
		return tool.executor(args, context);
	}

	/**
	 * Convert tool call to our Instruction format.
	 * Strips the ai11y_ prefix when mapping to instruction actions.
	 */
	convertToolCall(toolCall: {
		type: "function";
		function: { name: string; arguments: string };
	}): Instruction | null {
		const tool = this.tools.get(toolCall.function.name);
		if (!tool) {
			return null;
		}

		const args = JSON.parse(toolCall.function.arguments);
		// Strip the ai11y_ prefix to get the action name
		const action = toolCall.function.name.replace(/^ai11y_/, "");

		if (action === "navigate") {
			return { action: "navigate", route: args.route };
		}
		if (action === "click") {
			return { action: "click", id: args.id };
		}
		if (action === "highlight") {
			return { action: "highlight", id: args.id };
		}
		if (action === "scroll") {
			return { action: "scroll", id: args.id };
		}
		if (action === "fillInput") {
			return {
				action: "fillInput",
				id: args.id,
				value: args.value,
			};
		}

		return null;
	}

	/**
	 * Check if a tool is registered
	 */
	hasTool(name: string): boolean {
		return this.tools.has(name);
	}
}

/**
 * Convert an Ai11yTool (MCP-compatible) to a ToolDefinition (agent-compatible).
 * Maps InputSchema to ToolDefinition parameters format.
 */
function toToolDefinition(tool: Ai11yTool): ToolDefinition {
	const properties: Record<string, { type: string; description: string }> = {};
	if (tool.parameters.properties) {
		for (const [key, value] of Object.entries(tool.parameters.properties)) {
			const prop = value as { type?: string; description?: string };
			properties[key] = {
				type: prop.type ?? "string",
				description: prop.description ?? "",
			};
		}
	}
	return {
		name: tool.name,
		description: tool.description,
		parameters: {
			type: "object",
			properties,
			required: tool.parameters.required as string[] | undefined,
		},
	};
}

/**
 * Default tool registry populated from the canonical ai11yTools definitions.
 * Tools use ai11y_ prefixed names and `id` as the parameter name.
 */
export function createDefaultToolRegistry(): ToolRegistry {
	const registry = new ToolRegistry();

	// The tools the agent can call. The executor returns a stub result;
	// the real side-effects happen client-side via instructions.
	const defaultExecutor: ToolExecutor = async (args) => ({
		success: true,
		...args,
	});

	for (const tool of ai11yTools) {
		// Skip describe/setState/getState — they are WebMCP-only tools
		// that the server-side agent doesn't need
		if (
			tool.name === "ai11y_describe" ||
			tool.name === "ai11y_setState" ||
			tool.name === "ai11y_getState"
		) {
			continue;
		}

		registry.register(toToolDefinition(tool), defaultExecutor);
	}

	return registry;
}
