import {
	clickMarker,
	fillInputMarker,
	highlightMarker,
	navigateToRoute,
	scrollToMarker,
} from "./dom-actions/index.js";

export type { ExtractedElement, FormInfo } from "./dom.js";
export { type Ai11yContext, type DescribeLevel, getContext } from "./dom.js";
export {
	clickMarker,
	fillInputMarker,
	highlightMarker,
	navigateToRoute,
	scrollToMarker,
} from "./dom-actions/index.js";
export type { Marker } from "./marker.js";
export { getMarkers } from "./marker.js";
export type { PlanRequest, PlanResponse } from "./plan.js";
export { plan, setPlanEndpoint } from "./plan.js";
export {
	clearContext,
	clearEvents,
	clearState,
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
export * from "./util/attributes.js";

export type Instruction =
	| { action: "click"; id: string }
	| { action: "navigate"; route: string }
	| { action: "highlight"; id: string }
	| { action: "scroll"; id: string }
	| { action: "fillInput"; id: string; value: string };

export type ToolExecutor = (args: unknown) => Promise<unknown>;

export interface ToolDefinition {
	name: string;
	description: string;
	inputSchema: unknown;
	execute: ToolExecutor;
}

export function act(instruction: Instruction): void {
	const action = instruction.action.replace(/^ai11y_/, "");
	switch (action) {
		case "click":
			clickMarker(instruction.id);
			break;
		case "navigate":
			navigateToRoute(instruction.route);
			break;
		case "highlight":
			highlightMarker(instruction.id);
			break;
		case "scroll":
			scrollToMarker(instruction.id);
			break;
		case "fillInput":
			fillInputMarker(instruction.id, instruction.value);
			break;
	}
}

export type { Ai11yTool } from "./tool-schemas.js";
export * from "./tool-schemas.js";

import "./webmcp.js";
