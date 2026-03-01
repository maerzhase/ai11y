import type { Instruction } from "./index.js";

export interface PlanRequest {
	message: string;
	context: {
		route?: string;
		state?: Record<string, unknown>;
		markers: Array<{
			id: string;
			label: string;
			elementType: string;
		}>;
	};
	history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface PlanResponse {
	instructions: Instruction[];
	reply?: string;
}

const DEFAULT_API_ENDPOINT = "/api/ai11y/agent";

let apiEndpoint = DEFAULT_API_ENDPOINT;

export function setPlanEndpoint(endpoint: string) {
	apiEndpoint = endpoint;
}

export async function plan(
	message: string,
	context: {
		route?: string;
		state?: Record<string, unknown>;
		markers: Array<{ id: string; label: string; elementType: string }>;
	},
	options?: {
		history?: Array<{ role: "user" | "assistant"; content: string }>;
		endpoint?: string;
	},
): Promise<PlanResponse> {
	const endpoint = options?.endpoint ?? apiEndpoint;

	const response = await fetch(endpoint, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			message,
			context,
			history: options?.history ?? [],
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message ?? "Failed to get plan");
	}

	return response.json();
}
