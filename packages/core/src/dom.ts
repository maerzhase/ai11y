import { getMarkers } from "./marker.js";
import { getError, getRoute, getState } from "./store.js";
import type { UIAIContext } from "./types/index.js";

/**
 * Composes a complete UIAIContext from singleton state and DOM markers
 *
 * @param root - Optional DOM root element to scan for markers (defaults to document.body)
 * @returns A complete UIAIContext object with markers from DOM and state from singleton
 *
 * @example
 * ```ts
 * import { setRoute, setState, getContext } from '@ui4ai/core';
 *
 * setRoute('/billing');
 * setState({ userId: '123' });
 * const context = getContext();
 * ```
 */
export function getContext(root?: Element): UIAIContext {
	const context: UIAIContext = {
		markers: getMarkers(root),
	};

	// Get state from singleton
	const route = getRoute();
	const state = getState();
	const error = getError();

	// Only include optional fields if they are defined
	if (route !== undefined) {
		context.route = route;
	}
	if (state !== undefined) {
		context.state = state;
	}
	if (error !== undefined) {
		context.error = error;
	}

	return context;
}
