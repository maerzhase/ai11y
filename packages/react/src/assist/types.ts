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
export interface MarkerMetadata {
	id: string;
	label: string;
	intent: string;
	element: HTMLElement;
}

export interface LLMAgentConfig {
	/**
	 * API endpoint URL for the agent server (e.g., "http://localhost:3000/quest/agent")
	 */
	apiEndpoint: string;
}
