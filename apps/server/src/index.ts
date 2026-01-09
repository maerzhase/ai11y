/**
 * Example server using Fastify
 *
 * Run with: pnpm dev
 */

import "dotenv/config";
import cors from "@fastify/cors";
import { ui4aiPlugin } from "@ui4ai/server/fastify";
import Fastify from "fastify";

// Determine provider and validate API key
const provider = (process.env.LLM_PROVIDER || "openai") as
	| "openai"
	| "anthropic"
	| "google"
	| "custom";

let apiKey: string | undefined;
switch (provider) {
	case "openai":
		apiKey = process.env.OPENAI_API_KEY;
		break;
	case "anthropic":
		apiKey = process.env.ANTHROPIC_API_KEY;
		break;
	case "google":
		apiKey = process.env.GOOGLE_API_KEY;
		break;
	case "custom":
		apiKey = process.env.CUSTOM_API_KEY || process.env.OPENAI_API_KEY;
		break;
}

if (!apiKey) {
	console.error(`❌ Error: API key is required for provider: ${provider}`);
	console.error(
		`   Set ${provider.toUpperCase()}_API_KEY or OPENAI_API_KEY environment variable`,
	);
	process.exit(1);
}

// Start server
async function start() {
	const fastify = Fastify({
		logger: true,
	});

	// Register CORS plugin
	await fastify.register(cors, {
		// In development, allow all origins for easier local development
		// In production, you should specify exact origins
		origin:
			process.env.NODE_ENV === "production"
				? (origin, cb) => {
						// In production, restrict to specific origins
						// You can customize this list based on your frontend domain(s)
						const allowedOrigins =
							process.env.ALLOWED_ORIGINS?.split(",") || [];
						if (origin && allowedOrigins.includes(origin)) {
							cb(null, true);
						} else {
							cb(null, false);
						}
					}
				: true, // Allow all origins in development
		credentials: true,
	});

	// Build config based on provider
	const config: any = {
		provider,
		apiKey,
		model: process.env.LLM_MODEL,
		temperature: process.env.LLM_TEMPERATURE
			? Number(process.env.LLM_TEMPERATURE)
			: undefined,
	};

	// Add provider-specific defaults
	if (!config.model) {
		switch (provider) {
			case "openai":
				config.model = "gpt-4o-mini";
				break;
			case "anthropic":
				config.model = "claude-3-haiku-20240307";
				break;
			case "google":
				config.model = "gemini-pro";
				break;
			case "custom":
				config.model = process.env.LLM_MODEL || "gpt-4o-mini";
				break;
		}
	}

	// Add baseURL if provided
	if (process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL) {
		config.baseURL = process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL;
	}

	// For custom provider, baseURL is required
	if (provider === "custom" && !config.baseURL) {
		console.error("❌ Error: LLM_BASE_URL is required for custom provider");
		process.exit(1);
	}

	// Register the ui4ai plugin
	await fastify.register(ui4aiPlugin, {
		config,
	});

	try {
		const port = Number(process.env.PORT) || 3000;
		await fastify.listen({ port, host: "0.0.0.0" });
		console.log(`🚀 Server listening on http://localhost:${port}`);
		console.log(`📡 Agent endpoint: http://localhost:${port}/ui4ai/agent`);
		console.log(`🌐 CORS enabled for localhost origins`);
		console.log(`🤖 LLM Provider: ${provider} (${config.model})`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

start();
