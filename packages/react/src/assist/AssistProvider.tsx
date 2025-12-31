import {
	getError,
	getEvents,
	getRoute,
	getState,
	getContext as getUIContextFromCore,
	setError,
	setState,
	subscribe,
	subscribeToStore,
	track,
} from "@quest/core";
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
	AgentConfig,
	UIAIError,
	UIAIEvent,
	UIAIState,
	UIAIContext,
} from "./types";

interface UIAIProviderContextValue {
	// State
	assistState: UIAIState;
	currentRoute: string;
	lastError: UIAIError | null;
	events: UIAIEvent[];


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
	getContext: () => UIAIContext;

	// Agent config
	agentConfig: AgentConfig | null;
}

const UIAIProviderContext = createContext<UIAIProviderContextValue | null>(null);

export function useAssist() {
	const context = useContext(UIAIProviderContext);
	if (!context) {
		throw new Error("useAssist must be used within UIAIProvider");
	}
	return context;
}

interface UIAIProviderProps {
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
	agentConfig?: AgentConfig;
}

export function UIAIProvider({
	children,
	initialState = {},
	onNavigate,
	highlightWrapper,
	agentConfig,
}: UIAIProviderProps) {
	// Initialize core store with initial state if provided
	useEffect(() => {
		if (Object.keys(initialState).length > 0) {
			setState(initialState);
		}
	}, [initialState]); // Only run on mount

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
		[],
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
	}, []);

	const togglePanelForMarker = useCallback(
		(markerId: string, message: string) => {
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
		},
		[],
	);

	const clearPendingMessage = useCallback(() => {
		setPendingMessage(null);
	}, []);

	const getContext = useCallback((): UIAIContext => {
		// Use getContext from core - it reads from singleton and scans DOM
		return getUIContextFromCore();
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

	const value: UIAIProviderContextValue = {
		assistState,
		currentRoute,
		lastError,
		events,
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
		agentConfig: agentConfig ?? null,
	};

	return (
		<UIAIProviderContext.Provider value={value}>
			{children}
		</UIAIProviderContext.Provider>
	);
}
