import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import type {
	AssistContext,
	AssistError,
	AssistEvent,
	AssistState,
	MarkerMetadata,
} from "./types";

interface AssistContextValue {
	// State
	assistState: AssistState;
	currentRoute: string;
	lastError: AssistError | null;
	events: AssistEvent[];

	// Marker registry
	markers: Map<string, MarkerMetadata>;
	registerMarker: (metadata: MarkerMetadata) => void;
	unregisterMarker: (id: string) => void;

	// Imperative API
	track: (event: string, payload?: unknown) => void;
	reportError: (error: Error, meta?: { surface?: string; markerId?: string }) => void;
	navigate: (route: string) => void;
	highlight: (markerId: string) => void;
	click: (markerId: string) => void;

	// Panel control
	isPanelOpen: boolean;
	setIsPanelOpen: (open: boolean) => void;

	// Context for agent
	getContext: () => AssistContext;
}

const AssistContext = createContext<AssistContextValue | null>(null);

export function useAssist() {
	const context = useContext(AssistContext);
	if (!context) {
		throw new Error("useAssist must be used within AssistProvider");
	}
	return context;
}

interface AssistProviderProps {
	children: React.ReactNode;
	initialState?: AssistState;
	onNavigate?: (route: string) => void;
}

export function AssistProvider({
	children,
	initialState = {},
	onNavigate,
}: AssistProviderProps) {
	const [assistState, setAssistState] = useState<AssistState>(initialState);
	const [currentRoute, setCurrentRoute] = useState<string>("/");
	const [lastError, setLastError] = useState<AssistError | null>(null);
	const [events, setEvents] = useState<AssistEvent[]>([]);
	const [markers, setMarkers] = useState<Map<string, MarkerMetadata>>(new Map());
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const highlightTimeoutRef = useRef<number | null>(null);

	const registerMarker = useCallback((metadata: MarkerMetadata) => {
		setMarkers((prev) => {
			const next = new Map(prev);
			next.set(metadata.id, metadata);
			return next;
		});
	}, []);

	const unregisterMarker = useCallback((id: string) => {
		setMarkers((prev) => {
			const next = new Map(prev);
			next.delete(id);
			return next;
		});
	}, []);

	const track = useCallback((event: string, payload?: unknown) => {
		setEvents((prev) => [
			...prev.slice(-49), // Keep last 50 events
			{
				type: event,
				payload,
				timestamp: Date.now(),
			},
		]);
	}, []);

	const reportError = useCallback(
		(error: Error, meta?: { surface?: string; markerId?: string }) => {
			const assistError: AssistError = {
				error,
				meta,
				timestamp: Date.now(),
			};
			setLastError(assistError);
			setIsPanelOpen(true);
			track("error", { error: error.message, meta });
		},
		[track],
	);

	const navigate = useCallback(
		(route: string) => {
			setCurrentRoute(route);
			if (onNavigate) {
				onNavigate(route);
			}
			track("navigate", { route });
		},
		[onNavigate, track],
	);

	const highlight = useCallback(
		(markerId: string) => {
			const marker = markers.get(markerId);
			if (!marker) {
				console.warn(`Marker ${markerId} not found`);
				return;
			}

			// Clear any existing highlight timeout
			if (highlightTimeoutRef.current) {
				clearTimeout(highlightTimeoutRef.current);
			}

			const element = marker.element;
			const originalOutline = element.style.outline;
			const originalOutlineOffset = element.style.outlineOffset;
			const originalTransition = element.style.transition;

			// Apply highlight
			element.style.outline = "3px solid #3b82f6";
			element.style.outlineOffset = "2px";
			element.style.transition = "outline 0.2s ease";

			// Remove highlight after 2 seconds
			highlightTimeoutRef.current = window.setTimeout(() => {
				element.style.outline = originalOutline;
				element.style.outlineOffset = originalOutlineOffset;
				element.style.transition = originalTransition;
				highlightTimeoutRef.current = null;
			}, 2000);

			track("highlight", { markerId });
		},
		[markers, track],
	);

	const click = useCallback(
		(markerId: string) => {
			const marker = markers.get(markerId);
			if (!marker) {
				console.warn(`Marker ${markerId} not found`);
				return;
			}

			if (marker.action) {
				marker.action();
			} else {
				// Fallback: trigger click on the element
				marker.element.click();
			}

			track("click", { markerId });
		},
		[markers, track],
	);

	const getContext = useCallback((): AssistContext => {
		return {
			currentRoute,
			assistState,
			lastError,
			markers: Array.from(markers.values()).map((m) => ({
				id: m.id,
				label: m.label,
				intent: m.intent,
			})),
		};
	}, [currentRoute, assistState, lastError, markers]);

	// Cleanup highlight on unmount
	useEffect(() => {
		return () => {
			if (highlightTimeoutRef.current) {
				clearTimeout(highlightTimeoutRef.current);
			}
		};
	}, []);

	const value: AssistContextValue = {
		assistState,
		currentRoute,
		lastError,
		events,
		markers,
		registerMarker,
		unregisterMarker,
		track,
		reportError,
		navigate,
		highlight,
		click,
		isPanelOpen,
		setIsPanelOpen,
		getContext,
	};

	return (
		<AssistContext.Provider value={value}>{children}</AssistContext.Provider>
	);
}

