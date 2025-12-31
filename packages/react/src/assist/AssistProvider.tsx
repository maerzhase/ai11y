import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	getUIContext,
	getRoute,
	getState,
	getError,
	getEvents,
	setState,
	setError,
	subscribe,
	subscribeToStore,
	track,
} from "@quest/core";
import type {
	UIContext,
	UIAIError,
	UIAIEvent,
	UIAIState,
	LLMAgentConfig,
	MarkerMetadata,
} from "./types";

interface AssistContextValue {
	// State
	assistState: UIAIState;
	currentRoute: string;
	lastError: UIAIError | null;
	events: UIAIEvent[];

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
	// Internal: used by useAssistTools hook
	addHighlight: (markerId: string, duration?: number) => void;
	onNavigate?: (route: string) => void;

	// Focused marker (clicked marker bubble)
	focusedMarkerId: string | null;

	// Imperative API
	track: (event: string, payload?: unknown) => void;
	reportError: (
		error: Error,
		meta?: { surface?: string; markerId?: string },
	) => void;
	// Note: Tool functions (navigate, highlight, scroll, click) are available via:
	// - Core functions: import { navigateToRoute, highlightMarker, scrollToMarker, clickMarker } from "@quest/core"
	// - React-specific wrappers: import { useAssistTools } from "@quest/react"

	// Panel control
	isPanelOpen: boolean;
	setIsPanelOpen: (open: boolean) => void;
	openPanelWithMessage: (message: string) => void;
	togglePanelForMarker: (markerId: string, message: string) => void;
	clearPendingMessage: () => void;
	pendingMessage: string | null;

	// Context for agent
	getContext: () => UIContext;

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
	initialState?: UIAIState;
	onNavigate?: (route: string) => void;
	/**
	 * Component used to wrap highlighted elements.
	 * Receives `{ children, markerId }` as props.
	 * For side effects (analytics, logging), use the `onHighlight` option in `highlightMarker()` from `@quest/core`.
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
	highlightWrapper,
	llmConfig = null,
}: AssistProviderProps) {
	// Initialize core store with initial state if provided
	useEffect(() => {
		if (Object.keys(initialState).length > 0) {
			setState(initialState);
		}
	}, []); // Only run on mount

	// Read from core store reactively
	const [currentRoute, setCurrentRoute] = useState<string>(
		() => getRoute() || "/",
	);
	const [assistState, setAssistState] = useState<UIAIState>(() => {
		const coreState = getState();
		return coreState || {};
	});
	const [lastError, setLastError] = useState<UIAIError | null>(() => {
		const coreError = getError();
		return coreError || null;
	});
	const [events, setEvents] = useState<UIAIEvent[]>(() => getEvents());

	// Subscribe to store changes for reactivity
	useEffect(() => {
		const unsubscribe = subscribeToStore(
			(type: "route" | "state" | "error", value: unknown) => {
				if (type === "route") {
					setCurrentRoute((value as string) || "/");
				} else if (type === "state") {
					setAssistState((value as UIAIState) || {});
				} else if (type === "error") {
					setLastError((value as UIAIError | null) || null);
				}
			},
		);
		return unsubscribe;
	}, []);
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

	// Subscribe to events from core store for reactivity
	useEffect(() => {
		const unsubscribe = subscribe(() => {
			setEvents([...getEvents()]);
		});
		return unsubscribe;
	}, []);

	const reportError = useCallback(
		(error: Error, meta?: { surface?: string; markerId?: string }) => {
			const assistError: UIAIError = {
				error,
				meta,
				timestamp: Date.now(),
			};
			// Set error in core store (will trigger subscription update)
			setError(assistError);
			setIsPanelOpen(true);
			// Track event - events will be synced via subscription
			track("error", { error: error.message, meta });
		},
		[track],
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

	const getContext = useCallback((): UIContext => {
		// Use getUIContext from core - it reads from singleton and scans DOM
		return getUIContext();
	}, []);

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
		addHighlight,
		onNavigate,
		focusedMarkerId,
		track,
		reportError,
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
