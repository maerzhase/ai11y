/**
 * @ai11y/agent type definitions
 *
 * Provides types for running the ai11y planning agent with various LLM providers.
 * Supports OpenAI and Anthropic, with extensible tool registration.
 *
 * @packageDocumentation
 */

import type { Ai11yTool } from "@ai11y/core";

/**
 * Re-export ai11y tools from core package
 */
export type { Ai11yTool } from "@ai11y/core";

/**
 * Server-side configuration for the ai11y agent
 *
 * @example
 * ```typescript
 * const config: ServerConfig = {
 *   apiKey: process.env.OPENAI_API_KEY!,
 *   provider: "openai",
 *   model: "gpt-4o-mini",
 *   temperature: 0,
 * };
 * ```
 */
export interface ServerConfig {
	/** API key for the LLM provider */
	apiKey: string;
	/** LLM provider to use (default: "openai") */
	provider?: "openai" | "anthropic";
	/** Model identifier (default: "gpt-4o-mini" for OpenAI) */
	model?: string;
	/** Override the default API base URL */
	baseURL?: string;
	/** Sampling temperature (0-2, default: 0) */
	temperature?: number;
	/** Maximum tokens to generate */
	maxTokens?: number;
}

/**
 * Agent configuration extending ServerConfig with tool support
 *
 * @example
 * ```typescript
 * const agentConfig: AgentConfig = {
 *   apiKey: process.env.OPENAI_API_KEY!,
 *   model: "gpt-4o",
 *   tools: customToolRegistry,
 * };
 * ```
 */
export interface AgentConfig extends ServerConfig {
	/** Optional custom tool registry (uses default ai11y tools if not provided) */
	tools?: ToolRegistry;
}

/**
 * Tool definition alias for ai11y tools (MCP compatible)
 *
 * @example
 * ```typescript
 * const toolDef: ToolDefinition = {
 *   name: "ai11y_click",
 *   description: "Click an element by its ID",
 *   parameters: {
 *     type: "object",
 *     properties: {
 *       id: { type: "string", description: "Element ID" }
 *     },
 *     required: ["id"]
 *   }
 * };
 * ```
 */
export type ToolDefinition = Ai11yTool;

/**
 * Context object passed to tool executors
 *
 * @example
 * ```typescript
 * const context: Ai11yContext = {
 *   route: "/billing",
 *   state: { theme: "dark" },
 *   markers: [
 *     { id: "submit_btn", label: "Submit", elementType: "button" }
 *   ]
 * };
 * ```
 */
export interface Ai11yContext {
	/** Current route/path in the application */
	route?: string;
	/** Application state shared with the agent */
	state?: Record<string, unknown>;
	/** Available interactive elements on the page */
	markers: Array<{ id: string; label: string; elementType: string }>;
}

/**
 * Function that executes a tool with the given arguments and context
 *
 * @param args - Arguments provided by the LLM
 * @param context - Current page context including route, state, and markers
 * @returns Result of tool execution
 *
 * @example
 * ```typescript
 * const executor: ToolExecutor = async (args, context) => {
 *   console.log(`Clicking element: ${args.id}`);
 *   return { success: true };
 * };
 * ```
 */
export type ToolExecutor = (
	args: Record<string, unknown>,
	context: Ai11yContext,
) => Promise<unknown>;

/**
 * Registry for managing agent tools
 *
 * @remarks
 * The ToolRegistry class provides methods to register, unregister, and execute tools.
 * By default, it comes pre-populated with the standard ai11y tools, but can be
 * extended with custom tools for specific use cases.
 *
 * @example
 * ```typescript
 * const registry = createToolRegistry();
 *
 * registry.register(
 *   {
 *     name: "send_email",
 *     description: "Send an email",
 *     parameters: { type: "object", properties: { to: { type: "string" } } }
 *   },
 *   async (args, context) => { /* send email *!/ }
 * );
 *
 * const tools = registry.getAllTools();
 * const hasTool = registry.has("send_email");
 * ```
 */
export class ToolRegistry {
	private tools: Map<
		string,
		{ definition: ToolDefinition; executor: ToolExecutor }
	> = new Map();

	/**
	 * Registers a new tool with the registry
	 * @param definition - Tool definition including name, description, and parameters
	 * @param executor - Function to execute the tool
	 * @throws Error if a tool with the same name is already registered
	 */
	register(definition: ToolDefinition, executor: ToolExecutor): void {
		if (this.tools.has(definition.name)) {
			throw new Error(`Tool ${definition.name} is already registered`);
		}
		this.tools.set(definition.name, { definition, executor });
	}

	/**
	 * Removes a tool from the registry
	 * @param name - Name of the tool to remove
	 * @returns True if the tool was found and removed
	 */
	unregister(name: string): boolean {
		return this.tools.delete(name);
	}

	/**
	 * Gets a tool by name
	 * @param name - Tool name to look up
	 * @returns Tool definition and executor, or undefined if not found
	 */
	getTool(name: string) {
		return this.tools.get(name);
	}

	/**
	 * Gets all registered tools
	 * @returns Array of all tool definitions
	 */
	getAllTools(): ToolDefinition[] {
		return Array.from(this.tools.values()).map((t) => t.definition);
	}

	/**
	 * Gets all registered tool names
	 * @returns Array of tool names
	 */
	getToolNames(): string[] {
		return Array.from(this.tools.keys());
	}

	/**
	 * Executes a tool by name
	 * @param name - Name of the tool to execute
	 * @param args - Arguments to pass to the tool
	 * @param context - Current page context
	 * @returns Result of tool execution
	 * @throws Error if the tool is not found
	 */
	async execute(
		name: string,
		args: Record<string, unknown>,
		context: Ai11yContext,
	): Promise<unknown> {
		const tool = this.tools.get(name);
		if (!tool) {
			throw new Error(`Tool ${name} not found`);
		}
		return tool.executor(args, context);
	}

	/**
	 * Checks if a tool is registered
	 * @param name - Tool name to check
	 * @returns True if the tool is registered
	 */
	has(name: string): boolean {
		return this.tools.has(name);
	}
}

/**
 * Instruction to be executed on the client
 *
 * @example
 * ```typescript
 * const instruction: Instruction = {
 *   action: "click",
 *   id: "submit_button"
 * };
 * ```
 */
export interface Instruction {
	/** Action type to perform */
	action: string;
	/** Optional element ID for element-specific actions */
	id?: string;
	/** Optional route for navigation actions */
	route?: string;
	/** Optional value for input/fill actions */
	value?: string;
	/** Additional action-specific parameters */
	[key: string]: unknown;
}

/**
 * Request payload for the agent
 *
 * @example
 * ```typescript
 * const request: AgentRequest = {
 *   message: "Click the submit button",
 *   context: {
 *     route: "/",
 *     markers: [{ id: "submit_btn", label: "Submit", elementType: "button" }]
 *   },
 *   history: [
 *     { role: "user", content: "Hello" },
 *     { role: "assistant", content: "Hi! How can I help?" }
 *   ]
 * };
 * ```
 */
export interface AgentRequest {
	/** User message to process */
	message: string;
	/** Current page/context information */
	context: Ai11yContext;
	/** Optional conversation history */
	history?: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Response from the agent
 *
 * @example
 * ```typescript
 * const response: AgentResponse = {
 *   instructions: [
 *     { action: "click", id: "submit_btn" },
 *     { action: "scroll", id: "footer" }
 *   ],
 *   reply: "I'll click the submit button for you"
 * };
 * ```
 */
export interface AgentResponse {
	/** Instructions to execute on the client */
	instructions: Instruction[];
	/** Optional text response to show the user */
	reply?: string;
}

/**
 * Request specifically for the plan function (alias for AgentRequest)
 */
export interface PlanRequest extends AgentRequest {}

/**
 * Response specifically for the plan function (alias for AgentResponse)
 */
export interface PlanResponse extends AgentResponse {}
