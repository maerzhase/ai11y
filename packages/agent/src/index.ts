/**
 * @ai11y/agent
 *
 * Server-side agent for running ai11y planning with various LLM providers.
 * Supports OpenAI and Anthropic, with extensible tool registration.
 *
 * @packageDocumentation
 */

import { ai11yTools } from "@ai11y/core";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { planWithOpenAI } from "./lib/openai.js";
import { generateSystemPrompt } from "./lib/prompt.js";
import type {
	AgentConfig,
	AgentRequest,
	AgentResponse,
	ServerConfig,
	ToolDefinition,
	ToolExecutor,
	ToolRegistry,
} from "./types.js";
import { ToolRegistry as ToolRegistryClass } from "./types.js";

/**
 * Creates a ToolRegistry pre-populated with the default ai11y tools
 *
 * @returns A ToolRegistry instance with all standard ai11y tools registered
 *
 * @example
 * ```typescript
 * import { createDefaultToolRegistry } from "@ai11y/agent";
 *
 * const registry = createDefaultToolRegistry();
 * console.log(registry.getToolNames());
 * // ["ai11y_describe", "ai11y_click", "ai11y_fillInput", ...]
 * ```
 *
 * @see {@link createToolRegistry} for creating an empty registry
 */
export function createDefaultToolRegistry(): ToolRegistry {
	const registry = new ToolRegistryClass();

	for (const tool of ai11yTools) {
		registry.register(
			{
				name: tool.name,
				description: tool.description,
				parameters: tool.parameters,
			},
			async () => ({ success: true }),
		);
	}

	return registry;
}

/**
 * Creates an empty ToolRegistry for custom tools
 *
 * @returns A new empty ToolRegistry instance
 *
 * @example
 * ```typescript
 * import { createToolRegistry } from "@ai11y/agent";
 *
 * const registry = createToolRegistry();
 * registry.register(
 *   {
 *     name: "my_custom_tool",
 *     description: "Does something useful",
 *     parameters: { type: "object", properties: {} }
 *   },
 *   async (args, context) => ({ result: "done" })
 * );
 * ```
 *
 * @see {@link createDefaultToolRegistry} for getting pre-populated tools
 */
export function createToolRegistry(): ToolRegistry {
	return new ToolRegistryClass();
}

/**
 * Runs the ai11y agent with the given request and configuration
 *
 * @param request - The agent request containing message, context, and optional history
 * @param config - Server configuration including API key and provider settings
 * @param toolRegistry - Optional custom tool registry (uses default ai11y tools if not provided)
 * @returns Promise resolving to agent response with instructions and optional reply
 *
 * @example
 * ```typescript
 * import { runAgent, createDefaultToolRegistry } from "@ai11y/agent";
 *
 * const config = {
 *   apiKey: process.env.OPENAI_API_KEY!,
 *   model: "gpt-4o-mini"
 * };
 *
 * const response = await runAgent(
 *   {
 *     message: "Click the submit button",
 *     context: {
 *       route: "/",
 *       markers: [{ id: "submit", label: "Submit", elementType: "button" }]
 *     }
 *   },
 *   config
 * );
 *
 * console.log(response.instructions);
 * // [{ action: "click", id: "submit" }]
 * ```
 *
 * @throws Error if the specified provider is not supported
 */
export async function runAgent(
	request: AgentRequest,
	config: ServerConfig,
	toolRegistry?: ToolRegistry,
): Promise<AgentResponse> {
	const {
		apiKey,
		provider = "openai",
		model = "gpt-4o-mini",
		baseURL,
		temperature = 0,
		maxTokens,
	} = config;

	const systemPrompt = generateSystemPrompt(
		toolRegistry?.getAllTools() || ai11yTools,
	);

	const { message, context, history = [] } = request;

	const contextMessage = `Current page context:
- Route: ${context.route || "/"}
- Markers (${context.markers?.length || 0}):
${context.markers?.map((m) => `  - ${m.id}: ${m.label} (${m.elementType})`).join("\n") || "  (none)"}

${context.state ? `- State: ${JSON.stringify(context.state)}` : ""}`;

	if (provider === "openai") {
		return planWithOpenAI({
			apiKey,
			model,
			baseURL,
			temperature,
			maxTokens,
			message,
			contextMessage,
			history,
			systemPrompt,
		});
	}

	if (provider === "anthropic") {
		throw new Error("Anthropic provider coming soon");
	}

	throw new Error(`Provider ${provider} not supported`);
}

/**
 * Creates an agent instance with a simpler API for repeated calls
 *
 * @param config - Agent configuration including API key, provider, model, and optional tools
 * @returns Agent instance with plan method and toolRegistry
 *
 * @example
 * ```typescript
 * import { createAgent } from "@ai11y/agent";
 *
 * const agent = createAgent({
 *   apiKey: process.env.OPENAI_API_KEY!,
 *   model: "gpt-4o-mini"
 * });
 *
 * const response = await agent.plan({
 *   message: "Scroll to bottom",
 *   context: { markers: [] }
 * });
 * ```
 */
export function createAgent(config: AgentConfig) {
	const {
		apiKey,
		provider = "openai",
		model = "gpt-4o-mini",
		baseURL,
		temperature = 0,
		tools,
	} = config;

	const toolRegistry = tools || createDefaultToolRegistry();
	const systemPrompt = generateSystemPrompt(toolRegistry.getAllTools());

	/**
	 * Plans actions based on user message and current context
	 * @param request - Plan request with message and context
	 * @returns Promise resolving to plan response with instructions
	 */
	async function plan(request: AgentRequest): Promise<AgentResponse> {
		const { message, context, history = [] } = request;

		const contextMessage = `Current page context:
- Route: ${context.route || "/"}
- Markers (${context.markers?.length || 0}):
${context.markers?.map((m) => `  - ${m.id}: ${m.label} (${m.elementType})`).join("\n") || "  (none)"}

${context.state ? `- State: ${JSON.stringify(context.state)}` : ""}`;

		if (provider === "openai") {
			return planWithOpenAI({
				apiKey,
				model,
				baseURL,
				temperature,
				message,
				contextMessage,
				history,
				systemPrompt,
			});
		}

		throw new Error(`Provider ${provider} not supported yet`);
	}

	return { plan, toolRegistry };
}

/**
 * Options for the Fastify plugin
 */
export interface Ai11yAgentPluginOptions {
	/** Server configuration for the LLM provider */
	config: ServerConfig;
	/** Optional custom tool registry */
	toolRegistry?: ToolRegistry;
}

declare module "fastify" {
	interface FastifyInstance {
		ai11y: {
			run: (request: AgentRequest) => Promise<AgentResponse>;
			toolRegistry: ToolRegistry;
		};
	}
}

/**
 * Fastify plugin for ai11y agent endpoints
 *
 * @remarks
 * This plugin registers:
 * - `GET /ai11y/health` - Health check endpoint
 * - `POST /ai11y/agent` - Agent execution endpoint
 *
 * The plugin decorates the Fastify instance with an `ai11y` object
 * containing the run function and toolRegistry.
 *
 * @example
 * ```typescript
 * import Fastify from "fastify";
 * import { ai11yAgentPlugin } from "@ai11y/agent";
 *
 * const fastify = Fastify();
 *
 * await fastify.register(ai11yAgentPlugin, {
 *   config: {
 *     apiKey: process.env.OPENAI_API_KEY!,
 *     model: "gpt-4o-mini"
 *   }
 * });
 *
 * await fastify.listen({ port: 3000 });
 * // Endpoints available:
 * // - GET /ai11y/health
 * // - POST /ai11y/agent
 * ```
 *
 * @param fastify - Fastify instance to register the plugin on
 * @param options - Plugin configuration options
 */
export const ai11yAgentPlugin: FastifyPluginAsync<
	Ai11yAgentPluginOptions
> = async (fastify: FastifyInstance, options) => {
	const { config, toolRegistry: customRegistry } = options;
	const toolRegistry = customRegistry || createDefaultToolRegistry();

	fastify.decorate("ai11y", {
		run: (request: AgentRequest) => runAgent(request, config, toolRegistry),
		toolRegistry,
	});

	fastify.get("/ai11y/health", async () => {
		return { status: "ok", provider: config.provider || "openai" };
	});

	fastify.post<{ Body: AgentRequest }>(
		"/ai11y/agent",
		{
			schema: {
				body: {
					type: "object",
					required: ["message", "context"],
					properties: {
						message: { type: "string" },
						context: {
							type: "object",
							properties: {
								route: { type: "string" },
								state: { type: "object" },
								markers: {
									type: "array",
									items: {
										type: "object",
										properties: {
											id: { type: "string" },
											label: { type: "string" },
											elementType: { type: "string" },
										},
									},
								},
							},
						},
						history: {
							type: "array",
							items: {
								type: "object",
								properties: {
									role: { type: "string", enum: ["user", "assistant"] },
									content: { type: "string" },
								},
							},
						},
					},
				},
			},
		},
		async (request) => {
			try {
				const result = await runAgent(request.body, config, toolRegistry);
				return result;
			} catch (error) {
				return {
					error: error instanceof Error ? error.message : "Internal error",
				};
			}
		},
	);
};

export type {
	AgentConfig,
	AgentRequest,
	AgentResponse,
	Ai11yContext,
	Instruction,
	PlanRequest,
	PlanResponse,
	ServerConfig,
	ToolDefinition,
	ToolExecutor,
	ToolRegistry,
} from "./types.js";
