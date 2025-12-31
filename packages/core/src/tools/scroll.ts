import { track } from "../store";
import { findMarkerElement } from "./find-element";

/**
 * Scrolls to a marker element by its ID
 *
 * @param markerId - The marker ID to scroll to
 *
 * @example
 * ```ts
 * scrollToMarker('connect_stripe');
 * ```
 */
export function scrollToMarker(markerId: string): void {
	const element = findMarkerElement(markerId);
	if (!element) {
		console.warn(`Marker ${markerId} not found`);
		return;
	}

	element.scrollIntoView({
		behavior: "smooth",
		block: "center",
		inline: "nearest",
	});

	track("scroll", { markerId });
}

