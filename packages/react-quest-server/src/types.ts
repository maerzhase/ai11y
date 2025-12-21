/**
 * Shared types between client and server
 */

export type ToolCall =
	| { type: "navigate"; route: string }
	| { type: "highlight"; markerId: string }
	| { type: "click"; markerId: string };

export interface AgentResponse {
	reply: string;
	toolCalls?: ToolCall[];
}

export interface AssistContext {
	currentRoute: string;
	assistState: Record<string, unknown>;
	lastError: {
		error: {
			message: string;
		};
		meta?: {
			surface?: string;
			markerId?: string;
		};
		timestamp: number;
	} | null;
	markers: Array<{
		id: string;
		label: string;
		intent: string;
	}>;
}

export interface AgentRequest {
	input: string;
	context: AssistContext;
}

/**
 * Supported LLM providers
 */
export type LLMProvider = "openai" | "anthropic" | "google" | "custom";

/**
 * Base configuration for LLM providers
 */
export interface BaseLLMConfig {
	provider: LLMProvider;
	model?: string;
	temperature?: number;
}

/**
 * OpenAI provider configuration
 */
export interface OpenAIConfig extends BaseLLMConfig {
	provider: "openai";
	apiKey: string;
	baseURL?: string;
}

/**
 * Anthropic provider configuration
 */
export interface AnthropicConfig extends BaseLLMConfig {
	provider: "anthropic";
	apiKey: string;
	baseURL?: string;
}

/**
 * Google provider configuration
 */
export interface GoogleConfig extends BaseLLMConfig {
	provider: "google";
	apiKey: string;
	baseURL?: string;
}

/**
 * Custom provider configuration (for OpenAI-compatible APIs)
 */
export interface CustomConfig extends BaseLLMConfig {
	provider: "custom";
	apiKey: string;
	baseURL: string;
	model: string; // Required for custom providers
}

/**
 * Union type for all provider configurations
 */
export type ServerConfig =
	| OpenAIConfig
	| AnthropicConfig
	| GoogleConfig
	| CustomConfig;

/**
 * Legacy config format for backward compatibility
 * @deprecated Use ServerConfig with explicit provider instead
 */
export interface LegacyServerConfig {
	apiKey: string;
	model?: string;
	baseURL?: string;
}

/**
 * Tool definition for extensibility
 */
export interface ToolDefinition {
	name: string;
	description: string;
	parameters: {
		type: "object";
		properties: Record<
			string,
			{
				type: string;
				description: string;
			}
		>;
		required?: string[];
	};
}

/**
 * Tool executor function
 */
export type ToolExecutor = (
	args: Record<string, unknown>,
	context: AssistContext,
) => Promise<unknown> | unknown;
