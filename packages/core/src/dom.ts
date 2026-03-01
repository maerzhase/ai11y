import type { Marker } from "./marker.js";
import { getMarkers } from "./marker.js";
import { getError, getEvents, getRoute, getState } from "./store.js";
import { getAllMarkersSelector, getMarkerSelector } from "./util/attributes.js";

export type DescribeLevel = "markers" | "interactive" | "full";

export interface Ai11yContext {
	markers: Marker[];
	level: DescribeLevel;
	route?: string;
	state?: Record<string, unknown>;
	error?: unknown;
	events: Array<{
		type: string;
		payload?: unknown;
		timestamp: number;
	}>;
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

const inViewMarkerIdsSet = new Set<string>();

function getElementByMarkerId(markerId: string): Element | null {
	if (typeof document === "undefined") return null;
	return document.querySelector(getMarkerSelector(markerId));
}

function getAllMarkerElements(): NodeListOf<Element> {
	if (typeof document === "undefined") return {} as NodeListOf<Element>;
	return document.querySelectorAll(getAllMarkersSelector());
}

function updateInViewMarkers(): void {
	if (typeof document === "undefined") return;

	const markers = getMarkers(document.body);
	inViewMarkerIdsSet.clear();

	const viewportHeight =
		typeof window !== "undefined" ? window.innerHeight : Infinity;
	const viewportWidth =
		typeof window !== "undefined" ? window.innerWidth : Infinity;

	for (const marker of markers) {
		const element = getElementByMarkerId(marker.id);
		if (element) {
			const rect = element.getBoundingClientRect();
			const isVisible =
				rect.top >= 0 &&
				rect.left >= 0 &&
				rect.bottom <= viewportHeight &&
				rect.right <= viewportWidth;

			if (isVisible) {
				inViewMarkerIdsSet.add(marker.id);
			}
		}
	}
}

export function getContext(
	root?: Element,
	level: DescribeLevel = "markers",
): Ai11yContext {
	const context: Ai11yContext = {
		markers: [],
		level,
		events: [],
		inViewMarkerIds: [],
	};

	const route = getRoute();
	const state = getState();
	const error = getError();
	const events = getEvents();

	if (route !== undefined) {
		context.route = route;
	}
	if (state !== undefined) {
		context.state = state;
	}
	if (error !== undefined) {
		context.error = error;
	}
	if (events !== undefined) {
		context.events = events;
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

	updateInViewMarkers();
	context.inViewMarkerIds = Array.from(inViewMarkerIdsSet);

	return context;
}

export function refreshInViewMarkers(): string[] {
	updateInViewMarkers();
	return Array.from(inViewMarkerIdsSet);
}
