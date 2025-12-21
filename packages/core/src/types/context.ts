/**
 * Application state that can be tracked by the assist system
 */
export interface AssistState {
	[key: string]: unknown;
}

/**
 * Error information tracked by the assist system
 */
export interface AssistError {
	error: Error;
	meta?: {
		surface?: string;
		markerId?: string;
	};
	timestamp: number;
}

/**
 * Marker information for UI elements
 */
export interface Marker {
	id: string;
	label: string;
	intent: string;
}

/**
 * Context information available to the agent
 * Contains current application state, route, errors, and available UI markers
 */
export interface AssistContext {
	currentRoute: string;
	assistState: AssistState;
	lastError: AssistError | null;
	markers: Marker[];
}
