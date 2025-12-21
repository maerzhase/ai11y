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
	const highlightTimeoutRef = useRef<Map<string, number>>(new Map());

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

			// If highlightWrapper is provided, use component-based highlighting
			if (highlightWrapper) {
				// Mark as highlighted for component wrapper
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

				// Remove highlight after 2 seconds (default duration)
				const timeout = window.setTimeout(() => {
					setHighlightedMarkers((prev) => {
						const next = new Set(prev);
						next.delete(markerId);
						return next;
					});
					highlightTimeoutRef.current.delete(markerId);
				}, 2000);

				highlightTimeoutRef.current.set(markerId, timeout);
				track("highlight", { markerId });
				return;
			}

			// Default highlight behavior (classname-based)
			// Clear any existing highlight timeout
			const existingTimeout = highlightTimeoutRef.current.get(markerId);
			if (existingTimeout) {
				clearTimeout(existingTimeout);
			}

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
				highlightTimeoutRef.current.delete(markerId);
			}, 2000);

			highlightTimeoutRef.current.set(markerId, timeout);
			track("highlight", { markerId });
		},
		[markers, track, onHighlight, highlightWrapper],
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

			track("scroll", { markerId });
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
		track,
		reportError,
		navigate,
		highlight,
		scroll,
		click,
		isPanelOpen,
		setIsPanelOpen,
		openPanelWithMessage,
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
