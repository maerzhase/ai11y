/**
 * Example server using Fastify
 *
 * Run with: pnpm dev
 */

import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { questPlugin } from "@react-quest/server/fastify";

// Validate API key
if (!process.env.OPENAI_API_KEY) {
	console.error("❌ Error: OPENAI_API_KEY environment variable is required");
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
		origin: process.env.NODE_ENV === "production" 
			? (origin, cb) => {
				// In production, restrict to specific origins
				// You can customize this list based on your frontend domain(s)
				const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
				if (origin && allowedOrigins.includes(origin)) {
					cb(null, true);
				} else {
					cb(null, false);
				}
			}
			: true, // Allow all origins in development
		credentials: true,
	});

	// Register the quest plugin
	await fastify.register(questPlugin, {
		config: {
			apiKey: process.env.OPENAI_API_KEY,
			model: process.env.OPENAI_MODEL || "gpt-4o-mini",
			baseURL: process.env.OPENAI_BASE_URL,
		},
	});

	try {
		const port = Number(process.env.PORT) || 3000;
		await fastify.listen({ port, host: "0.0.0.0" });
		console.log(`🚀 Server listening on http://localhost:${port}`);
		console.log(`📡 Agent endpoint: http://localhost:${port}/quest/agent`);
		console.log(`🌐 CORS enabled for localhost origins`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

start();
