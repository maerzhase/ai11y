/**
 * Server configuration for LLM providers
 */
export interface ServerConfig {
	provider: "openai";
	apiKey: string;
	model?: string;
	temperature?: number;
	baseURL?: string;
}
