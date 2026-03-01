import type { Marker } from "./marker.js";
import { getMarkers } from "./marker.js";
import { getError, getRoute, getState } from "./store.js";

export type DescribeLevel = "markers" | "interactive" | "full";

export interface Ai11yContext {
	markers: Marker[];
	level: DescribeLevel;
	route?: string;
	state?: Record<string, unknown>;
	error?: unknown;
	page?: {
		url: string;
		title: string;
	};
	inViewMarkerIds: string[];
}

export interface ExtractedElement {
	id: string;
	tag: string;
	text: string;
	selector: string;
}

export interface FormInfo {
	selector: string;
	inputs: Array<{
		name: string;
		type: string;
		selector: string;
	}>;
}

export function getContext(
	root?: Element,
	level: DescribeLevel = "markers",
): Ai11yContext {
	const context: Ai11yContext = {
		markers: [],
		level,
		inViewMarkerIds: [],
	};

	const route = getRoute();
	const state = getState();
	const error = getError();

	if (route !== undefined) {
		context.route = route;
	}
	if (state !== undefined) {
		context.state = state;
	}
	if (error !== undefined) {
		context.error = error;
	}

	if (typeof document === "undefined") {
		return context;
	}

	const doc = root ?? document;

	context.markers = getMarkers(doc as Element);
	context.page = {
		url: window.location.href,
		title: document.title,
	};

	return context;
}
