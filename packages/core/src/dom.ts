import { getMarkers } from "./marker.js";
import { getError, getRoute, getState } from "./store.js";
import type { Ai11yContext } from "./context.js";
import { getAllMarkersSelector, getMarkerId } from "./util/attributes.js";

/**
 * Detects which markers are currently visible in the viewport
 *
 * @param root - Optional DOM root element to scan for markers (defaults to document.body)
 * @returns Array of marker IDs that are currently in view
 */
function getInViewMarkerIds(root?: Element): string[] {
	// Check if we're in a browser environment
	if (typeof document === "undefined" || typeof window === "undefined") {
		return [];
	}

	const scanRoot = root ?? document.body;
	if (!scanRoot) {
		return [];
	}

	// Find all elements with data-ai-id attribute
	const elements = scanRoot.querySelectorAll(getAllMarkersSelector());
	const inViewIds: string[] = [];

	// Use IntersectionObserver to check visibility
	// For synchronous checking, we'll use getBoundingClientRect
	for (let i = 0; i < elements.length; i++) {
		const element = elements[i];
		const id = getMarkerId(element);
		if (!id) continue;

		// Check if element is in viewport
		const rect = element.getBoundingClientRect();
		const isInView =
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <=
				(window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth);

		// Also check if element is partially visible (more lenient check)
		const isPartiallyVisible =
			rect.top <
				(window.innerHeight || document.documentElement.clientHeight) &&
			rect.bottom > 0 &&
			rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
			rect.right > 0;

		if (isInView || isPartiallyVisible) {
			inViewIds.push(id);
		}
	}

	return inViewIds;
}

/**
 * Composes a complete Ai11yContext from singleton state and DOM markers
 *
 * @param root - Optional DOM root element to scan for markers (defaults to document.body)
 * @returns A complete Ai11yContext object with markers from DOM and state from singleton
 *
 * @example
 * ```ts
 * import { setRoute, setState, getContext } from '@ai11y/core';
 *
 * setRoute('/billing');
 * setState({ userId: '123' });
 * const context = getContext();
 * ```
 */
export function getContext(root?: Element): Ai11yContext {
	const context: Ai11yContext = {
		markers: getMarkers(root),
		inViewMarkerIds: getInViewMarkerIds(root),
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
