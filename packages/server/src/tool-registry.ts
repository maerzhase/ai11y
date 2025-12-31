import type {
	ToolCall,
	ToolDefinition,
	ToolExecutor,
	UIContext,
} from "./types";

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
		context: UIContext,
	): Promise<unknown> {
		const tool = this.tools.get(toolName);
		if (!tool) {
			throw new Error(`Tool "${toolName}" is not registered`);
		}
		return tool.executor(args, context);
	}

	/**
	 * Convert OpenAI tool call to our ToolCall format
	 */
	convertToolCall(toolCall: {
		type: "function";
		function: { name: string; arguments: string };
	}): ToolCall | null {
		const tool = this.tools.get(toolCall.function.name);
		if (!tool) {
			return null;
		}

		const args = JSON.parse(toolCall.function.arguments);

		// Built-in tools
		if (toolCall.function.name === "navigate") {
			return { type: "navigate", route: args.route };
		}
		if (toolCall.function.name === "click") {
			return { type: "click", markerId: args.markerId };
		}
		if (toolCall.function.name === "highlight") {
			return { type: "highlight", markerId: args.markerId };
		}
		if (toolCall.function.name === "scroll") {
			return { type: "scroll", markerId: args.markerId };
		}

		// For custom tools, we return null and let the executor handle it
		// The executor result can be used for follow-up messages
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
 * Default tool registry with built-in tools
 */
export function createDefaultToolRegistry(): ToolRegistry {
	const registry = new ToolRegistry();

	// Register built-in tools
	registry.register(
		{
			name: "navigate",
			description: "Navigate to a different route/page in the application",
			parameters: {
				type: "object",
				properties: {
					route: {
						type: "string",
						description:
							"The route to navigate to (e.g., '/billing', '/integrations', '/')",
					},
				},
				required: ["route"],
			},
		},
		async (args) => {
			// Navigation is handled client-side, just return success
			return { success: true, route: args.route };
		},
	);

	registry.register(
		{
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
		async (args) => {
			// Click is handled client-side, just return success
			return { success: true, markerId: args.markerId };
		},
	);

	registry.register(
		{
			name: "highlight",
			description:
				"Highlight a UI element by its marker ID to draw the user's attention. This will also scroll the element into view.",
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
		async (args) => {
			// Highlight is handled client-side, just return success
			return { success: true, markerId: args.markerId };
		},
	);

	registry.register(
		{
			name: "scroll",
			description:
				"Scroll to a UI element by its marker ID to bring it into view without highlighting",
			parameters: {
				type: "object",
				properties: {
					markerId: {
						type: "string",
						description: "The ID of the marker to scroll to",
					},
				},
				required: ["markerId"],
			},
		},
		async (args) => {
			// Scroll is handled client-side, just return success
			return { success: true, markerId: args.markerId };
		},
	);

	return registry;
}
