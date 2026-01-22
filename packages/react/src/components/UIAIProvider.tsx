import {
	createClient,
	getError,
	getEvents,
	getRoute,
	getState,
	setState,
	subscribe,
	subscribeToStore,
	type AgentConfig,
	type UIAIError,
	type UIAIEvent,
	type UIAIState,
} from "@ui4ai/core";
import type React from "react";
import {
	createContext,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

export interface UIAIProviderContextValue {
	// State
	state: UIAIState;
	currentRoute: string;
	lastError: UIAIError | null;
	events: UIAIEvent[];

	// Highlight state
	highlightedMarkers: Set<string>;
	highlightWrapper?: React.ComponentType<{
		children: React.ReactNode;
		markerId: string;
	}>;
	addHighlight: (markerId: string, duration?: number) => void;
	onNavigate?: (route: string) => void;

	// Focused marker (clicked marker bubble)
	focusedMarkerId: string | null;

	// Imperative API (from UIAIClient)
	track: (event: string, payload?: unknown) => void;
	reportError: (
		error: Error,
		meta?: { surface?: string; markerId?: string },
	) => void;
	describe: () => import("@ui4ai/core").UIAIContext;
	act: (instruction: import("@ui4ai/core").Instruction) => void;

	// Panel control
	isPanelOpen: boolean;
	setIsPanelOpen: (open: boolean) => void;
	openPanelWithMessage: (message: string) => void;
	togglePanelForMarker: (markerId: string, message: string) => void;
	clearPendingMessage: () => void;
	pendingMessage: string | null;

	// Agent config
	agentConfig: AgentConfig | null;
}

const UIAIProviderContext = createContext<UIAIProviderContextValue | null>(
	null,
);

interface UIAIProviderProps {
	children: React.ReactNode;
	initialState?: UIAIState;
	onNavigate?: (route: string) => void;
	/**
	 * Component used to wrap highlighted elements.
	 * Receives `{ children, markerId }` as props.
	 * For side effects (analytics, logging), use the `onHighlight` option in `highlightMarker()` from `@ui4ai/core`.
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
	// Create client instance
	const clientRef = useRef(
		createClient({
			onNavigate,
		}),
	);

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
	const [uiState, setUIState] = useState<UIAIState>(() => {
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
				setUIState((value as UIAIState) || {});
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
			clientRef.current.reportError(error, meta);
			setIsPanelOpen(true);
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
		clientRef.current.track("panel_opened_with_message", { message });
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
				clientRef.current.track("panel_closed_by_marker", { markerId });
				return;
			}

			// Otherwise, focus this marker and open panel with message
			setFocusedMarkerId(markerId);
			setPendingMessage(message);
			setIsPanelOpen(true);
			clientRef.current.track("panel_opened_by_marker", { markerId, message });
		},
		[],
	);

	const clearPendingMessage = useCallback(() => {
		setPendingMessage(null);
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
		state: uiState,
		currentRoute,
		lastError,
		events,
		highlightedMarkers,
		highlightWrapper,
		addHighlight,
		onNavigate,
		focusedMarkerId,
		track: clientRef.current.track.bind(clientRef.current),
		reportError,
		describe: clientRef.current.describe.bind(clientRef.current),
		act: clientRef.current.act.bind(clientRef.current),
		isPanelOpen,
		setIsPanelOpen: handleSetIsPanelOpen,
		openPanelWithMessage,
		togglePanelForMarker,
		clearPendingMessage,
		pendingMessage,
		agentConfig: agentConfig ?? null,
	};

	return (
		<UIAIProviderContext.Provider value={value}>
			{children}
		</UIAIProviderContext.Provider>
	);
}

// Export context for useUIAIContext hook
export { UIAIProviderContext };
