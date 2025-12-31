// Re-export shared types from core
export type {
	AgentResponse,
	Marker,
	ToolCall,
	UIAIError,
	UIAIEvent,
	UIAIState,
	UIAIContext,
} from "@quest/core";

// React-specific types
export interface LLMAgentConfig {
	/**
	 * API endpoint URL for the agent server (e.g., "http://localhost:3000/quest/agent")
	 */
	apiEndpoint: string;
}

/**
 * Agent mode selection
 */
export type AgentMode = "llm" | "rule-based" | "dummy" | "auto";

/**
 * Unified agent configuration combining LLM settings with agent selection options
 */
export interface AgentConfig {
	/**
	 * API endpoint URL for the LLM agent server (required for "llm" mode)
	 */
	apiEndpoint?: string;

	/**
	 * Agent mode selection strategy
	 * - "llm": Always use LLM agent (requires apiEndpoint)
	 * - "rule-based": Always use rule-based agent
	 * - "dummy": Always use dummy agent (for testing/offline)
	 * - "auto": Use LLM if apiEndpoint is provided, fallback to rule-based on error, or dummy if explicitly offline
	 * @default "auto"
	 */
	mode?: AgentMode;

	/**
	 * Force offline mode (use dummy agent even if apiEndpoint is available)
	 * @default false
	 */
	forceOffline?: boolean;

	/**
	 * Environment detection - automatically use dummy agent in test environments
	 * @default true
	 */
	useDummyInTest?: boolean;
}
