export interface AgentConfig {
	apiKey: string;
	provider?: "openai" | "anthropic";
	model?: string;
	baseURL?: string;
	temperature?: number;
}

export interface Instruction {
	action: "click" | "navigate" | "highlight" | "scroll" | "fillInput";
	id?: string;
	route?: string;
	value?: string;
}

export interface PlanRequest {
	message: string;
	context: {
		route?: string;
		state?: Record<string, unknown>;
		markers: Array<{ id: string; label: string; elementType: string }>;
	};
	history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface PlanResponse {
	instructions: Instruction[];
	reply?: string;
}
