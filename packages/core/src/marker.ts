import {
	getAllMarkersSelector,
	getMarkerId,
	getMarkerIntent,
	getMarkerLabel,
} from "./util/attributes.js";
import { formatMarkerId } from "./util/format.js";

/**
 * Marker information for UI elements
 */
export interface Marker {
	id: string;
	label: string;
	intent: string;
	elementType: string;
	/** Current value for input/textarea elements */
	value?: string;
	/** Selected value(s) for select elements */
	selectedOptions?: string[];
	/** All available options for select elements */
	options?: Array<{ value: string; label: string }>;
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
 * Finds an input or textarea element within a marked element
 * Handles both direct input elements and nested inputs (when Mark wraps the input)
 */
function findInputElement(element: Element): HTMLInputElement | HTMLTextAreaElement | null {
	if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
		return element;
	}
	if (element instanceof HTMLElement) {
		const nestedInput = element.querySelector("input, textarea");
		if (
			nestedInput instanceof HTMLInputElement ||
			nestedInput instanceof HTMLTextAreaElement
		) {
			return nestedInput;
		}
	}
	return null;
}

/**
 * Finds a select element within a marked element
 * Handles both direct select elements and nested selects (when Mark wraps the select)
 */
function findSelectElement(element: Element): HTMLSelectElement | null {
	if (element instanceof HTMLSelectElement) {
		return element;
	}
	if (element instanceof HTMLElement) {
		const nestedSelect = element.querySelector("select");
		if (nestedSelect instanceof HTMLSelectElement) {
			return nestedSelect;
		}
	}
	return null;
}

/**
 * Extracts the value from an input or textarea element
 */
function extractInputValue(element: Element): string | undefined {
	const inputElement = findInputElement(element);
	if (!inputElement) {
		return undefined;
	}
	return inputElement.value;
}

/**
 * Extracts options and selected values from a select element
 */
function extractSelectData(
	element: Element,
): {
	options?: Array<{ value: string; label: string }>;
	selectedOptions?: string[];
} {
	const selectElement = findSelectElement(element);
	if (!selectElement) {
		return {};
	}

	const options: Array<{ value: string; label: string }> = [];
	for (let i = 0; i < selectElement.options.length; i++) {
		const option = selectElement.options[i];
		options.push({
			value: option.value,
			label: option.text,
		});
	}

	const selectedOptions: string[] = [];
	if (selectElement.multiple) {
		// Multi-select: collect all selected options
		for (let i = 0; i < selectElement.selectedOptions.length; i++) {
			selectedOptions.push(selectElement.selectedOptions[i].value);
		}
	} else {
		// Single select: use the value property
		if (selectElement.value) {
			selectedOptions.push(selectElement.value);
		}
	}

	return {
		options: options.length > 0 ? options : undefined,
		selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
	};
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
		const elementType = element.tagName.toLowerCase();

		const marker: Marker = {
			id,
			label,
			intent,
			elementType,
		};

		// Extract input/textarea value
		const inputValue = extractInputValue(element);
		if (inputValue !== undefined) {
			marker.value = inputValue;
		}

		// Extract select options and selected values
		const selectData = extractSelectData(element);
		if (selectData.options !== undefined) {
			marker.options = selectData.options;
		}
		if (selectData.selectedOptions !== undefined) {
			marker.selectedOptions = selectData.selectedOptions;
		}

		markers.push(marker);
	}

	return markers;
}
