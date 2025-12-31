import {
	getAllMarkersSelector,
	getMarkerId,
	getMarkerLabel,
	getMarkerIntent,
} from "./util/attributes";
import { formatMarkerId } from "./util/format";

/**
 * Marker information for UI elements
 */
export interface Marker {
	id: string;
	label: string;
	intent: string;
}

/**
 * Gets the document body in a type-safe way
 * Returns null if not in a browser environment
 */
function getDocumentBody(): Element | null {
	if (typeof document === "undefined") {
		return null;
	}
	return document.body;
}

/**
 * Scans the DOM for elements with data-ai-* attributes and returns markers
 *
 * @param root - Optional DOM root element to scan (defaults to document.body)
 * @returns Array of Marker objects found in the DOM
 *
 * @example
 * ```ts
 * const markers = getMarkers();
 * // Scans document.body for data-ai-* attributes
 * ```
 */
export function getMarkers(root?: Element): Marker[] {
	// Determine the root element to scan
	const scanRoot = root ?? getDocumentBody();

	// If no document/body available, return empty array
	if (!scanRoot) {
		return [];
	}

	// Find all elements with data-ai-id attribute
	const elements = scanRoot.querySelectorAll(getAllMarkersSelector());

	// Extract markers from elements
	const markers: Marker[] = [];
	for (let i = 0; i < elements.length; i++) {
		const element = elements[i];
		const id = getMarkerId(element);
		if (!id) continue; // Skip if id is missing

		const label = getMarkerLabel(element) || formatMarkerId(id);
		const intent = getMarkerIntent(element) || "";

		markers.push({
			id,
			label,
			intent,
		});
	}

	return markers;
}

