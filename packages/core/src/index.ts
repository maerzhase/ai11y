/**
 * @ai11y/core
 *
 * Core types and utilities shared across all ai11y packages.
 */

// Agent module
export {
	type AgentAdapterConfig,
	type AgentConfig,
	type AgentMode,
	type LLMAgentConfig,
	runAgentAdapter,
	runLLMAgent,
	runRuleBasedAgent,
} from "./agent/index.js";
export { plan } from "./agent/plan.js";

// Client API
export { type Ai11yClient, createClient } from "./client-api.js";

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
	fillInputMarker,
	type HighlightOptions,
	highlightMarker,
	navigateToRoute,
	scrollToMarker,
} from "./tools/index.js";
export * from "./types/index.js";
export * from "./util/index.js";
