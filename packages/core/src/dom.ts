import { getMarkers } from "./marker";
import { getError, getRoute, getState } from "./store";
import type { UIContext } from "./types";

/**
 * Composes a complete UIContext from singleton state and DOM markers
 *
 * @param root - Optional DOM root element to scan for markers (defaults to document.body)
 * @returns A complete UIContext object with markers from DOM and state from singleton
 *
 * @example
 * ```ts
 * import { setRoute, setState, getUIContext } from '@quest/core';
 *
 * setRoute('/billing');
 * setState({ userId: '123' });
 * const context = getUIContext();
 * ```
 */
export function getUIContext(root?: Element): UIContext {
	const context: UIContext = {
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
