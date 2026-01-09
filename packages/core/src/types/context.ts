import type { Marker } from "../marker.js";

/**
 * Application state for UI-to-AI context binding
 */
export interface UIAIState {
	[key: string]: unknown;
}

/**
 * Error information for UI-to-AI context binding
 */
export interface UIAIError {
	error: Error;
	meta?: {
		surface?: string;
		markerId?: string;
	};
	timestamp: number;
}

/**
 * Event information for UI-to-AI context binding
 */
export interface UIAIEvent {
	type: string;
	payload?: unknown;
	timestamp: number;
}

/**
 * Context information available to the agent
 * Contains current application state, route, errors, and available UI markers
 */
export interface UIAIContext {
	markers: Marker[];
	inViewMarkerIds?: string[];
	route?: string;
	state?: UIAIState;
	error?: UIAIError | null;
}
