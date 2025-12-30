import type React from "react";
import {
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
	LLMAgentConfig,
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

	// Highlight state
	highlightedMarkers: Set<string>;
	highlightWrapper?: React.ComponentType<{
		children: React.ReactNode;
		markerId: string;
	}>;

	// Focused marker (clicked marker bubble)
	focusedMarkerId: string | null;

	// Imperative API
	track: (event: string, payload?: unknown) => void;
	reportError: (
		error: Error,
		meta?: { surface?: string; markerId?: string },
	) => void;
	navigate: (route: string) => void;
	highlight: (markerId: string) => void;
	scroll: (markerId: string) => void;
	click: (markerId: string) => void;

	// Panel control
	isPanelOpen: boolean;
	setIsPanelOpen: (open: boolean) => void;
	openPanelWithMessage: (message: string) => void;
	togglePanelForMarker: (markerId: string, message: string) => void;
	clearPendingMessage: () => void;
	pendingMessage: string | null;

	// Context for agent
	getContext: () => AssistContext;

	// LLM config
	llmConfig: LLMAgentConfig | null;
}

const AssistReactContext = createContext<AssistContextValue | null>(null);

export function useAssist() {
	const context = useContext(AssistReactContext);
	if (!context) {
		throw new Error("useAssist must be used within AssistProvider");
	}
	return context;
}

interface AssistProviderProps {
	children: React.ReactNode;
	initialState?: AssistState;
	onNavigate?: (route: string) => void;
	/**
	 * Event handler called when an element is highlighted.
	 * Use this for side effects like analytics, logging, or DOM manipulation.
	 */
	onHighlight?: (markerId: string, element: HTMLElement) => void;
	/**
	 * Component used to wrap highlighted elements.
	 * Receives `{ children, markerId }` as props.
	 */
	highlightWrapper?: React.ComponentType<{
		children: React.ReactNode;
		markerId: string;
	}>;
	llmConfig?: LLMAgentConfig | null;
}

export function AssistProvider({
	children,
	initialState = {},
	onNavigate,
	onHighlight,
	highlightWrapper,
	llmConfig = null,
}: AssistProviderProps) {
	const [assistState, _setAssistState] = useState<AssistState>(initialState);
	const [currentRoute, setCurrentRoute] = useState<string>("/");
	const [lastError, setLastError] = useState<AssistError | null>(null);
	const [events, setEvents] = useState<AssistEvent[]>([]);
	const [markers, setMarkers] = useState<Map<string, MarkerMetadata>>(
		new Map(),
	);
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [pendingMessage, setPendingMessage] = useState<string | null>(null);
	const [highlightedMarkers, setHighlightedMarkers] = useState<Set<string>>(
		new Set(),
	);
	const [focusedMarkerId, setFocusedMarkerId] = useState<string | null>(null);
	const focusedMarkerIdRef = useRef<string | null>(null);
	const isPanelOpenRef = useRef(false);
	const highlightTimeoutRef = useRef<Map<string, number>>(new Map());

	// Keep refs in sync with state
	focusedMarkerIdRef.current = focusedMarkerId;
	isPanelOpenRef.current = isPanelOpen;

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

	const addHighlight = useCallback((markerId: string, duration = 2000) => {
		// Mark as highlighted (for bubble emphasis)
		setHighlightedMarkers((prev) => {
			const next = new Set(prev);
			next.add(markerId);
			return next;
		});

		// Clear any existing timeout for this marker
		const existingTimeout = highlightTimeoutRef.current.get(markerId);
		if (existingTimeout) {
			clearTimeout(existingTimeout);
		}

		// Remove highlight after duration
		const timeout = window.setTimeout(() => {
			setHighlightedMarkers((prev) => {
				const next = new Set(prev);
				next.delete(markerId);
				return next;
			});
			highlightTimeoutRef.current.delete(markerId);
		}, duration);

		highlightTimeoutRef.current.set(markerId, timeout);
	}, []);

	const highlight = useCallback(
		(markerId: string) => {
			const marker = markers.get(markerId);
			if (!marker) {
				console.warn(`Marker ${markerId} not found`);
				return;
			}

			const element = marker.element;

			// Scroll element into view
			element.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "nearest",
			});

			// Call event handler if provided (for side effects)
			if (onHighlight) {
				onHighlight(markerId, element);
			}

			// Always add to highlightedMarkers (for bubble emphasis)
			addHighlight(markerId);

			// If highlightWrapper is provided, let it handle visual highlighting
			if (highlightWrapper) {
				track("highlight", { markerId });
				return;
			}

			// Default highlight behavior (inline styles)
			const originalOutline = element.style.outline;
			const originalOutlineOffset = element.style.outlineOffset;
			const originalTransition = element.style.transition;

			// Apply highlight
			element.style.outline = "3px solid #3b82f6";
			element.style.outlineOffset = "2px";
			element.style.transition = "outline 0.2s ease";

			// Remove highlight after 2 seconds
			const timeout = window.setTimeout(() => {
				element.style.outline = originalOutline;
				element.style.outlineOffset = originalOutlineOffset;
				element.style.transition = originalTransition;
			}, 2000);

			// Store separate timeout for element styles cleanup
			const styleTimeoutKey = `${markerId}-style`;
			const existingStyleTimeout = highlightTimeoutRef.current.get(styleTimeoutKey);
			if (existingStyleTimeout) {
				clearTimeout(existingStyleTimeout);
			}
			highlightTimeoutRef.current.set(styleTimeoutKey, timeout);

			track("highlight", { markerId });
		},
		[markers, track, onHighlight, highlightWrapper, addHighlight],
	);

	const scroll = useCallback(
		(markerId: string) => {
			const marker = markers.get(markerId);
			if (!marker) {
				console.warn(`Marker ${markerId} not found`);
				return;
			}

			const element = marker.element;

			// Scroll element into view
			element.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "nearest",
			});

			// Highlight the bubble when scrolling to marker
			addHighlight(markerId);

			track("scroll", { markerId });
		},
		[markers, track, addHighlight],
	);

	const click = useCallback(
		(markerId: string) => {
			const marker = markers.get(markerId);
			if (!marker) {
				console.warn(`Marker ${markerId} not found`);
				return;
			}

			const element = marker.element;

			// Prefer native click to avoid double-firing handlers (important for toggles).
			if ("click" in element && typeof element.click === "function") {
				element.click();
			} else {
				// Fallback: dispatch a synthetic mouse event
				const mouseEvent = new MouseEvent("click", {
					view: window,
					bubbles: true,
					cancelable: true,
					buttons: 1,
				});
				element.dispatchEvent(mouseEvent);
			}

			track("click", { markerId });
		},
		[markers, track],
	);

	const openPanelWithMessage = useCallback((message: string) => {
		setPendingMessage(message);
		setIsPanelOpen(true);
		track("panel_opened_with_message", { message });
	}, [track]);

	const togglePanelForMarker = useCallback((markerId: string, message: string) => {
		// Use refs to avoid stale closure issues
		const currentFocusedId = focusedMarkerIdRef.current;
		const currentPanelOpen = isPanelOpenRef.current;

		// If this marker is already focused and panel is open, close the panel
		if (currentFocusedId === markerId && currentPanelOpen) {
			setIsPanelOpen(false);
			setFocusedMarkerId(null);
			track("panel_closed_by_marker", { markerId });
			return;
		}

		// Otherwise, focus this marker and open panel with message
		setFocusedMarkerId(markerId);
		setPendingMessage(message);
		setIsPanelOpen(true);
		track("panel_opened_by_marker", { markerId, message });
	}, [track]);

	const clearPendingMessage = useCallback(() => {
		setPendingMessage(null);
	}, []);

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

	// Cleanup highlights on unmount
	useEffect(() => {
		return () => {
			highlightTimeoutRef.current.forEach((timeout) => {
				clearTimeout(timeout);
			});
			highlightTimeoutRef.current.clear();
		};
	}, []);

	// Handle panel open state changes from external sources (Popover trigger, close button, etc.)
	const handleSetIsPanelOpen = useCallback((open: boolean) => {
		setIsPanelOpen(open);
		if (!open) {
			setFocusedMarkerId(null);
		}
	}, []);

	const value: AssistContextValue = {
		assistState,
		currentRoute,
		lastError,
		events,
		markers,
		registerMarker,
		unregisterMarker,
		highlightedMarkers,
		highlightWrapper,
		focusedMarkerId,
		track,
		reportError,
		navigate,
		highlight,
		scroll,
		click,
		isPanelOpen,
		setIsPanelOpen: handleSetIsPanelOpen,
		openPanelWithMessage,
		togglePanelForMarker,
		clearPendingMessage,
		pendingMessage,
		getContext,
		llmConfig,
	};

	return (
		<AssistReactContext.Provider value={value}>
			{children}
		</AssistReactContext.Provider>
	);
}
