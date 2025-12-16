export type ToolCall =
	| { type: "navigate"; route: string }
	| { type: "highlight"; markerId: string }
	| { type: "click"; markerId: string };

export interface AgentResponse {
	reply: string;
	toolCalls?: ToolCall[];
}

export interface MarkerMetadata {
	id: string;
	label: string;
	intent: string;
	action?: () => void;
	element: HTMLElement;
}

export interface AssistState {
	[key: string]: unknown;
}

export interface AssistEvent {
	type: string;
	payload?: unknown;
	timestamp: number;
}

export interface AssistError {
	error: Error;
	meta?: {
		surface?: string;
		markerId?: string;
	};
	timestamp: number;
}

export interface AssistContext {
	currentRoute: string;
	assistState: AssistState;
	lastError: AssistError | null;
	markers: Array<{
		id: string;
		label: string;
		intent: string;
	}>;
}

export interface LLMAgentConfig {
	apiKey: string;
	model?: string;
	baseURL?: string;
}

