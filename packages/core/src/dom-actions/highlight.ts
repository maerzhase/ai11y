import { track } from "../store.js";
import { findMarkerElement } from "./find-element.js";

/**
 * Options for highlighting a marker
 */
export interface HighlightOptions {
	/**
	 * Callback function called when marker is highlighted
	 */
	onHighlight?: (markerId: string, element: Element) => void;
	/**
	 * Duration in milliseconds for the highlight (default: 2000)
	 * Set to 0 to skip visual highlighting (useful when using custom highlight wrapper)
	 */
	duration?: number;
}

/**
 * Checks if an element is currently visible in the viewport
 */
function isElementInView(element: Element): boolean {
	const rect = element.getBoundingClientRect();
	const windowHeight =
		window.innerHeight || document.documentElement.clientHeight;
	const windowWidth = window.innerWidth || document.documentElement.clientWidth;

	// Check if element is partially visible (more lenient check)
	const isPartiallyVisible =
		rect.top < windowHeight &&
		rect.bottom > 0 &&
		rect.left < windowWidth &&
		rect.right > 0;

	return isPartiallyVisible;
}

/**
 * Highlights a marker element by its ID
 * Scrolls the element into view (only if not already in view) and applies visual highlighting
 *
 * @param markerId - The marker ID to highlight
 * @param options - Optional configuration for highlighting
 *
 * @example
 * ```ts
 * highlightMarker('connect_stripe', {
 *   onHighlight: (id, el) => console.log('Highlighted:', id),
 *   duration: 3000
 * });
 * ```
 */
export function highlightMarker(
	markerId: string,
	options: HighlightOptions = {},
): void {
	const element = findMarkerElement(markerId);
	if (!element) {
		console.warn(`Marker ${markerId} not found`);
		return;
	}

	const { onHighlight, duration = 2000 } = options;

	// Scroll element into view only if it's not already in view
	if (!isElementInView(element)) {
		element.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "nearest",
		});
	}

	// Call optional callback
	if (onHighlight) {
		onHighlight(markerId, element);
	}

	// Apply visual highlight (outline styles) only if duration > 0
	if (duration > 0) {
		const originalOutline = (element as HTMLElement).style.outline;
		const originalOutlineOffset = (element as HTMLElement).style.outlineOffset;
		const originalTransition = (element as HTMLElement).style.transition;

		// Apply highlight
		(element as HTMLElement).style.outline = "3px solid #3b82f6";
		(element as HTMLElement).style.outlineOffset = "2px";
		(element as HTMLElement).style.transition = "outline 0.2s ease";

		// Remove highlight after duration
		window.setTimeout(() => {
			(element as HTMLElement).style.outline = originalOutline;
			(element as HTMLElement).style.outlineOffset = originalOutlineOffset;
			(element as HTMLElement).style.transition = originalTransition;
		}, duration);
	}

	track("highlight", { markerId });
}
