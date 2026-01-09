import { track } from "../store.js";
import { findMarkerElement } from "./find-element.js";

/**
 * Fills an input element by its marker ID with a value, emitting native browser events
 *
 * @param markerId - The marker ID of the input element to fill
 * @param value - The value to fill into the input
 *
 * @example
 * ```ts
 * fillInputMarker('email_input', 'test@example.com');
 * ```
 */
export function fillInputMarker(markerId: string, value: string): void {
	let element = findMarkerElement(markerId);
	if (!element) {
		console.warn(`Marker ${markerId} not found`);
		return;
	}

	// If the marked element is not itself an input, try to find an input inside it
	// (in case Mark wraps the input in a container)
	let inputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
	
	if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
		inputElement = element;
	} else if (element instanceof HTMLElement) {
		// Search for input or textarea within the marked element
		const nestedInput = element.querySelector("input, textarea");
		if (nestedInput instanceof HTMLInputElement || nestedInput instanceof HTMLTextAreaElement) {
			inputElement = nestedInput;
		}
	}

	const isContentEditable =
		element instanceof HTMLElement && element.contentEditable === "true";

	if (!inputElement && !isContentEditable) {
		console.warn(
			`Marker ${markerId} does not contain an input, textarea, or contenteditable element`,
		);
		return;
	}

	// Set the value property (for React controlled components)
	if (inputElement) {
		// Step 1: Directly set the value
		// For React-controlled inputs, we must use the native setter to bypass React's value prop
		const prototype = inputElement instanceof HTMLTextAreaElement
			? HTMLTextAreaElement.prototype
			: HTMLInputElement.prototype;
		const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
		
		if (setter) {
			// Use native setter for React-controlled inputs
			setter.call(inputElement, value);
		} else {
			// Fallback: direct assignment for native inputs
			inputElement.value = value;
		}

		// Step 2: Dispatch the right events with bubbles: true
		// This is crucial - bubbles: true allows React/Vue/Angular to catch the events
		// input event → updates live state
		inputElement.dispatchEvent(new Event("input", { bubbles: true }));
		
		// change event → commits value (important for forms)
		inputElement.dispatchEvent(new Event("change", { bubbles: true }));

		// Step 3: Focus management (optional but useful)
		// Helps with validation, conditional UI, and accessibility expectations
		inputElement.focus();
	} else if (isContentEditable) {
		// For contenteditable elements, set textContent and dispatch events
		const editableElement = element as HTMLElement;
		editableElement.textContent = value;

		// Dispatch input event
		const inputEvent = new InputEvent("input", {
			bubbles: true,
			cancelable: true,
		});
		element.dispatchEvent(inputEvent);
	}

	track("fillInput", { markerId, value });
}
