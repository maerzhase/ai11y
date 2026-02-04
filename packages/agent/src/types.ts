/**
 * Re-export shared types from core
 */
export type {
	AgentRequest,
	AgentResponse,
	Instruction,
	ToolDefinition,
	ToolExecutor,
	Ai11yContext,
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
