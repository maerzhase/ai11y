/**
 * LLM Provider Factory
 * Creates LangChain-compatible LLM instances for different providers
 */

import type { BaseLanguageModel } from "@langchain/core/language_models/base";
import type { ServerConfig } from "./types";

/**
 * Create a LangChain LLM instance based on the provider configuration
 */
export async function createLLM(
	config: ServerConfig,
): Promise<BaseLanguageModel> {
	switch (config.provider) {
		case "openai": {
			const { ChatOpenAI } = await import("@langchain/openai");
			return new ChatOpenAI({
				modelName: config.model || "gpt-4o-mini",
				temperature: config.temperature ?? 0.7,
				openAIApiKey: config.apiKey,
				configuration: config.baseURL
					? {
							baseURL: config.baseURL,
						}
					: undefined,
			});
		}

		case "anthropic": {
			const { ChatAnthropic } = await import("@langchain/anthropic");
			return new ChatAnthropic({
				modelName: config.model || "claude-3-haiku-20240307",
				temperature: config.temperature ?? 0.7,
				anthropicApiKey: config.apiKey,
				anthropicApiUrl: config.baseURL,
			});
		}

		case "google": {
			const { ChatGoogleGenerativeAI } = await import(
				"@langchain/google-genai"
			);
			return new ChatGoogleGenerativeAI({
				modelName: config.model || "gemini-pro",
				temperature: config.temperature ?? 0.7,
				apiKey: config.apiKey,
				...(config.baseURL && { baseUrl: config.baseURL }),
			});
		}

		case "custom": {
			// Custom providers use OpenAI-compatible API
			const { ChatOpenAI } = await import("@langchain/openai");
			return new ChatOpenAI({
				modelName: config.model,
				temperature: config.temperature ?? 0.7,
				openAIApiKey: config.apiKey,
				configuration: {
					baseURL: config.baseURL,
				},
			});
		}

		default:
			throw new Error(
				`Unsupported provider: ${(config as ServerConfig).provider}`,
			);
	}
}

/**
 * Convert legacy config format to new ServerConfig format
 */
export function normalizeConfig(
	config: ServerConfig | { apiKey: string; model?: string; baseURL?: string },
): ServerConfig {
	// If it already has a provider, return as-is
	if ("provider" in config) {
		return config;
	}

	// Legacy format - default to OpenAI
	return {
		provider: "openai",
		apiKey: config.apiKey,
		model: config.model,
		baseURL: config.baseURL,
	};
}
