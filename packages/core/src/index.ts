/**
 * @quest/core
 *
 * Core types and utilities shared across all React Quest packages.
 */

export { getContext } from "./dom";
export { getSubscriberCount, notify, subscribe } from "./events";
export type { Marker } from "./marker";
export { getMarkers } from "./marker";
export {
	clearContext,
	clearEvents,
	getError,
	getEvents,
	getRoute,
	getState,
	setError,
	setRoute,
	setState,
	subscribeToStore,
	track,
} from "./store";
export {
	clickMarker,
	type HighlightOptions,
	highlightMarker,
	navigateToRoute,
	scrollToMarker,
} from "./tools";
export * from "./types";
export * from "./util";
