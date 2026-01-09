import type {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest,
	FastifyReply,
} from "fastify";
import { runAgent } from "./agent.js";
import { createDefaultToolRegistry, type ToolRegistry } from "./tool-registry.js";
import type { AgentRequest, ServerConfig } from "./types.js";

interface FastifyUi4aiOptions extends FastifyPluginOptions {
	config: ServerConfig;
	toolRegistry?: ToolRegistry;
}

/**
 * Fastify plugin for ui4ai server
 *
 * @example
 * ```ts
 * import Fastify from 'fastify';
 * import { ui4aiPlugin } from '@ui4ai/server/fastify';
 *
 * const fastify = Fastify();
 *
 * await fastify.register(ui4aiPlugin, {
 *   config: {
 *     provider: 'openai',
 *     apiKey: process.env.OPENAI_API_KEY!,
 *     model: 'gpt-4o-mini'
 *   }
 * });
 *
 * await fastify.listen({ port: 3000 });
 * ```
 */
export async function ui4aiPlugin(
	fastify: FastifyInstance,
	options: FastifyUi4aiOptions,
) {
	const { config, toolRegistry = createDefaultToolRegistry() } = options;

	// Validate config
	if (!config.apiKey) {
		throw new Error(`API key is required for provider: ${config.provider}`);
	}

	/**
	 * POST /ui4ai/agent
	 * Main endpoint for agent requests
	 */
	fastify.post<{ Body: AgentRequest }>(
		"/ui4ai/agent",
		async (
			request: FastifyRequest<{ Body: AgentRequest }>,
			reply: FastifyReply,
		) => {
			try {
				const response = await runAgent(request.body, config, toolRegistry);
				return reply.send(response);
			} catch (error) {
				fastify.log.error(error, "Error processing agent request");
				return reply.status(500).send({
					error: "Failed to process agent request",
					message: error instanceof Error ? error.message : "Unknown error",
				});
			}
		},
	);

	/**
	 * GET /ui4ai/health
	 * Health check endpoint
	 */
	fastify.get("/ui4ai/health", async (_request, reply) => {
		return reply.send({ status: "ok" });
	});
}

/**
 * Helper function to create a tool registry with custom tools.
 * Returns a ToolRegistry instance that supports method chaining.
 *
 * @example
 * ```ts
 * const registry = createToolRegistry()
 *   .register({
 *     name: "custom_action",
 *     description: "Perform a custom action",
 *     parameters: {
 *       type: "object",
 *       properties: {
 *         param: { type: "string", description: "A parameter" }
 *       },
 *       required: ["param"]
 *     }
 *   }, async (args) => {
 *     // Execute custom logic
 *     return { success: true };
 *   });
 * ```
 */
export function createToolRegistry(): ToolRegistry {
	return createDefaultToolRegistry();
}

// Re-export types for convenience
export type { ServerConfig, ToolDefinition, ToolExecutor } from "./types.js";
