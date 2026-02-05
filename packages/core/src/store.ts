import { notify } from "./events.js";
import type { Ai11yError, Ai11yEvent, Ai11yState } from "./context.js";

let route: string | undefined;
let state: Ai11yState | undefined;
let error: Ai11yError | null | undefined;
let events: Ai11yEvent[] = [];

type StoreChangeListener = (
	type: "route" | "state" | "error",
	value: unknown,
) => void;

const storeListeners = new Set<StoreChangeListener>();

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

export function setRoute(newRoute: string | undefined): void {
	route = newRoute;
	notifyStoreChange("route", newRoute);
}

export function getRoute(): string | undefined {
	return route;
}

export function setState(newState: Ai11yState | undefined): void {
	state = newState;
	notifyStoreChange("state", newState);
}

export function getState(): Ai11yState | undefined {
	return state;
}

export function setError(newError: Ai11yError | null | undefined): void {
	error = newError;
	notifyStoreChange("error", newError);
}

export function getError(): Ai11yError | null | undefined {
	return error;
}

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

export function getEvents(): Ai11yEvent[] {
	return events;
}

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
