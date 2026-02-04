import type { Marker } from "../marker.js";

/**
 * Application state for AI accessibility context binding
 */
export interface Ai11yState {
	[key: string]: unknown;
}

/**
 * Error information for AI accessibility context binding
 */
export interface Ai11yError {
	error: Error;
	meta?: {
		surface?: string;
		markerId?: string;
	};
	timestamp: number;
}

/**
 * Event information for AI accessibility context binding
 */
export interface Ai11yEvent {
	type: string;
	payload?: unknown;
	timestamp: number;
}

/**
 * Context information available to the agent
 * Contains current application state, route, errors, and available UI markers
 */
export interface Ai11yContext {
	markers: Marker[];
	inViewMarkerIds?: string[];
	route?: string;
	state?: Ai11yState;
	error?: Ai11yError | null;
}
