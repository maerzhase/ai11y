/**
 * @quest/core
 *
 * Core types and utilities shared across all React Quest packages.
 */

export * from "./types";
export type { Marker } from "./marker";
export { getMarkers } from "./marker";
export { getUIContext } from "./dom";
export * from "./util";
export {
	setRoute,
	getRoute,
	setState,
	getState,
	setError,
	getError,
	track,
	getEvents,
	clearEvents,
	clearContext,
} from "./store";
export { subscribe, notify, getSubscriberCount } from "./events";
export {
	scrollToMarker,
	highlightMarker,
	clickMarker,
	navigateToRoute,
	type HighlightOptions,
} from "./tools";
