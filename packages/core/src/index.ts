/**
 * @ui4ai/core
 *
 * Core types and utilities shared across all ui4ai packages.
 */

// Agent module
export {
	runAgentAdapter,
	runLLMAgent,
	runRuleBasedAgent,
	type AgentAdapterConfig,
	type AgentConfig,
	type AgentMode,
	type LLMAgentConfig,
} from "./agent/index.js";

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
