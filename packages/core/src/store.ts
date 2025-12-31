import type { UIAIError, UIAIEvent, UIAIState } from "./types";
import { notify } from "./events";

/**
 * Module-level singleton state for UI context
 */
let route: string | undefined;
let state: UIAIState | undefined;
let error: UIAIError | null | undefined;
let events: UIAIEvent[] = [];

/**
 * Set the current route
 */
export function setRoute(newRoute: string | undefined): void {
	route = newRoute;
}

/**
 * Get the current route
 */
export function getRoute(): string | undefined {
	return route;
}

/**
 * Set the current application state
 */
export function setState(newState: UIAIState | undefined): void {
	state = newState;
}

/**
 * Get the current application state
 */
export function getState(): UIAIState | undefined {
	return state;
}

/**
 * Set the current error
 */
export function setError(newError: UIAIError | null | undefined): void {
	error = newError;
}

/**
 * Get the current error
 */
export function getError(): UIAIError | null | undefined {
	return error;
}

/**
 * Track an event
 */
export function track(event: string, payload?: unknown): void {
	events = [
		...events.slice(-49), // Keep last 50 events
		{
			type: event,
			payload,
			timestamp: Date.now(),
		},
	];
	// Notify subscribers that an event was tracked
	notify();
}

/**
 * Get all tracked events
 */
export function getEvents(): UIAIEvent[] {
	return events;
}

/**
 * Clear all events
 */
export function clearEvents(): void {
	events = [];
}

/**
 * Clear all context state
 */
export function clearContext(): void {
	route = undefined;
	state = undefined;
	error = undefined;
	events = [];
}

