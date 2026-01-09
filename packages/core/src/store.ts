import { notify } from "./events.js";
import type { UIAIError, UIAIEvent, UIAIState } from "./types/index.js";

/**
 * Module-level singleton state for UI context
 */
let route: string | undefined;
let state: UIAIState | undefined;
let error: UIAIError | null | undefined;
let events: UIAIEvent[] = [];

/**
 * Store change listener type
 */
type StoreChangeListener = (
	type: "route" | "state" | "error",
	value: unknown,
) => void;

/**
 * Set of store change listeners
 */
const storeListeners = new Set<StoreChangeListener>();

/**
 * Notify all listeners of a store change
 */
function notifyStoreChange(
	type: "route" | "state" | "error",
	value: unknown,
): void {
	for (const listener of storeListeners) {
		try {
			listener(type, value);
		} catch (err) {
			// Don't let one listener's error break others
			console.error("Error in store change listener:", err);
		}
	}
}

/**
 * Set the current route
 */
export function setRoute(newRoute: string | undefined): void {
	route = newRoute;
	notifyStoreChange("route", newRoute);
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
	notifyStoreChange("state", newState);
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
	notifyStoreChange("error", newError);
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
 * Subscribe to store changes (route, state, error)
 * Returns an unsubscribe function
 *
 * @param listener - Function called when route, state, or error changes
 * @returns Unsubscribe function
 *
 * @example
 * ```ts
 * const unsubscribe = subscribeToStore((type, value) => {
 *   if (type === 'route') console.log('Route changed:', value);
 * });
 * // Later...
 * unsubscribe();
 * ```
 */
export function subscribeToStore(listener: StoreChangeListener): () => void {
	storeListeners.add(listener);
	return () => {
		storeListeners.delete(listener);
	};
}

/**
 * Clear all context state
 */
export function clearContext(): void {
	route = undefined;
	state = undefined;
	error = undefined;
	events = [];
	// Notify listeners of the clear
	notifyStoreChange("route", undefined);
	notifyStoreChange("state", undefined);
	notifyStoreChange("error", undefined);
}
