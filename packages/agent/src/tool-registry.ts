import type {
	Ai11yContext,
	Instruction,
	ToolDefinition,
	ToolExecutor,
} from "@ai11y/core";

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
	 * Convert OpenAI tool call to our Instruction format
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

		if (toolCall.function.name === "navigate") {
			return { action: "navigate", route: args.route };
		}
		if (toolCall.function.name === "click") {
			return { action: "click", id: args.markerId };
		}
		if (toolCall.function.name === "highlight") {
			return { action: "highlight", id: args.markerId };
		}
		if (toolCall.function.name === "scroll") {
			return { action: "scroll", id: args.markerId };
		}
		if (toolCall.function.name === "fillInput") {
			return {
				action: "fillInput",
				id: args.markerId,
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
 * Default tool registry with built-in tools
 */
export function createDefaultToolRegistry(): ToolRegistry {
	const registry = new ToolRegistry();

	registry.register(
		{
			name: "click",
			description:
				"Click a visible interactive element (link, button, etc.) by its marker ID. CRITICAL: Only use when markerId is in inViewMarkerIds. NEVER use if markerId is NOT in inViewMarkerIds - use 'scroll' instead.",
			parameters: {
				type: "object",
				properties: {
					markerId: {
						type: "string",
						description:
							"The ID of the marker to click. REQUIRED: Check inViewMarkerIds first. If NOT in list, use 'scroll' tool instead.",
					},
				},
				required: ["markerId"],
			},
		},
		async (args) => {
			return { success: true, markerId: args.markerId };
		},
	);

	registry.register(
		{
			name: "scroll",
			description:
				"Scroll to a UI element by its marker ID to bring it into view. Use this when 'navigate to [element]' means scrolling to an element, or when the marker is not in inViewMarkerIds. For visible link markers, use 'click' instead. For relative scrolling ('scroll to next' or 'scroll to previous'): CRITICAL - Skip markers that are in inViewMarkerIds. Find the next/previous marker in document order (markers array order) that is NOT in inViewMarkerIds. For 'next': find the first marker after any visible ones. For 'previous': find the first marker before any visible ones.",
			parameters: {
				type: "object",
				properties: {
					markerId: {
						type: "string",
						description:
							"The ID of the marker to scroll to. Use when marker is not in inViewMarkerIds. For relative scrolling: find the next/previous marker in the markers array that is NOT in inViewMarkerIds. Always skip markers already in view to avoid getting stuck.",
					},
				},
				required: ["markerId"],
			},
		},
		async (args) => {
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
			return { success: true, markerId: args.markerId };
		},
	);

	registry.register(
		{
			name: "navigate",
			description:
				"Navigate to a different route/page using a route path (e.g., '/billing', '/integrations'). Use only when 'navigate to [X]' refers to a route path, not a UI element. If X matches a marker, use 'scroll' instead (navigate to element = scroll to it).",
			parameters: {
				type: "object",
				properties: {
					route: {
						type: "string",
						description:
							"The route path to navigate to (e.g., '/billing', '/integrations', '/').",
					},
				},
				required: ["route"],
			},
		},
		async (args) => {
			return { success: true, route: args.route };
		},
	);

	registry.register(
		{
			name: "fillInput",
			description:
				"Fill a form field (input, textarea, or select) with a value by its marker ID. Emits native browser events to trigger React onChange handlers and form validation. Use when the user wants to enter text into a form field or select an option from a dropdown. For select elements, the value should match one of the available option values.",
			parameters: {
				type: "object",
				properties: {
					markerId: {
						type: "string",
						description:
							"The ID of the marker for the input/textarea/select element to fill",
					},
					value: {
						type: "string",
						description:
							"The value to fill the field with. For select elements, this must match one of the available option values.",
					},
				},
				required: ["markerId", "value"],
			},
		},
		async (args) => {
			return {
				success: true,
				markerId: args.markerId,
				value: args.value,
			};
		},
	);

	return registry;
}
