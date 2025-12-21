import type {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyReply,
	FastifyRequest,
} from "fastify";
import { runAgent } from "./agent";
import { normalizeConfig } from "./llm-provider";
import { createDefaultToolRegistry, type ToolRegistry } from "./tool-registry";
import type {
	AgentRequest,
	LegacyServerConfig,
	ServerConfig,
	ToolDefinition,
	ToolExecutor,
} from "./types";

interface FastifyQuestOptions extends FastifyPluginOptions {
	config: ServerConfig | LegacyServerConfig;
	toolRegistry?: ToolRegistry;
}

interface QuestRequest extends FastifyRequest {
	body: AgentRequest;
}

/**
 * Fastify plugin for React Quest server
 *
 * @example
 * ```ts
 * import Fastify from 'fastify';
 * import { questPlugin } from '@react-quest/server/fastify';
 *
 * const fastify = Fastify();
 *
 * // Using OpenAI (legacy format still works)
 * await fastify.register(questPlugin, {
 *   config: {
 *     provider: 'openai',
 *     apiKey: process.env.OPENAI_API_KEY!,
 *     model: 'gpt-4o-mini'
 *   }
 * });
 *
 * // Or using Anthropic
 * await fastify.register(questPlugin, {
 *   config: {
 *     provider: 'anthropic',
 *     apiKey: process.env.ANTHROPIC_API_KEY!,
 *     model: 'claude-3-haiku-20240307'
 *   }
 * });
 *
 * await fastify.listen({ port: 3000 });
 * ```
 */
export async function questPlugin(
	fastify: FastifyInstance,
	options: FastifyQuestOptions,
) {
	const { config, toolRegistry = createDefaultToolRegistry() } = options;

	// Normalize config (supports both new and legacy formats)
	const normalizedConfig = normalizeConfig(config);

	// Validate config
	if (!normalizedConfig.apiKey) {
		throw new Error(
			`API key is required for provider: ${normalizedConfig.provider}`,
		);
	}

	/**
	 * POST /quest/agent
	 * Main endpoint for agent requests
	 */
	fastify.post<QuestRequest>("/quest/agent", async (request, reply) => {
		try {
			const response = await runAgent(
				request.body,
				normalizedConfig,
				toolRegistry,
			);
			return reply.send(response);
		} catch (error) {
			fastify.log.error(error, "Error processing agent request");
			return reply.status(500).send({
				error: "Failed to process agent request",
				message: error instanceof Error ? error.message : "Unknown error",
			});
		}
	});

	/**
	 * GET /quest/health
	 * Health check endpoint
	 */
	fastify.get("/quest/health", async (_request, reply) => {
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
export type { ServerConfig, ToolDefinition, ToolExecutor } from "./types";
