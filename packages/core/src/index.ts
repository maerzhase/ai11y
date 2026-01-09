/**
 * @quest/core
 *
 * Core types and utilities shared across all React Quest packages.
 */

export { getContext } from "./dom.js";
export { getSubscriberCount, notify, subscribe } from "./events.js";
export type { Marker } from "./marker.js";
export { getMarkers } from "./marker.js";
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
} from "./store.js";
export {
	clickMarker,
	type HighlightOptions,
	highlightMarker,
	navigateToRoute,
	scrollToMarker,
} from "./tools/index.js";
export * from "./types/index.js";
export * from "./util/index.js";
