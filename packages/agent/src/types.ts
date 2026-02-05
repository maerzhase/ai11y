/**
 * Re-export shared types from core
 */
export type {
	AgentRequest,
	AgentResponse,
	Ai11yContext,
	Instruction,
	ToolDefinition,
	ToolExecutor,
} from "@ai11y/core";

/**
 * Server configuration
 */
export interface ServerConfig {
	provider: "openai";
	apiKey: string;
	model?: string;
	temperature?: number;
	baseURL?: string;
}
