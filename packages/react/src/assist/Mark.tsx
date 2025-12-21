import React, {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { useAssist } from "./AssistProvider";

interface MarkProps {
	id: string;
	label: string;
	intent: string;
	/**
	 * When true, renders a small speech-bubble button near the marked element.
	 * Clicking it opens the Assist panel pre-populated with a helpful prompt for this marker.
	 */
	showAssistBubble?: boolean;
	children: React.ReactElement;
}

function formatMarkerId(id: string): string {
	// Convert snake_case to readable text
	return id.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildMarkerPrompt({
	id,
	label,
	intent,
}: {
	id: string;
	label: string;
	intent: string;
}) {
	const safeIntent = intent?.trim();
	const safeLabel = label?.trim() || formatMarkerId(id);
	
	// Include the label so follow-up questions like "highlight it" can match
	// The label is what the agent will use to identify the marker in subsequent requests
	if (safeIntent) {
		return `Tell me about "${safeLabel}" - ${safeIntent}`;
	}
	return `Tell me about "${safeLabel}"`;
}

export function Mark({
	id,
	label,
	intent,
	showAssistBubble = false,
	children,
}: MarkProps) {
	const {
		registerMarker,
		unregisterMarker,
		highlightedMarkers,
		highlightWrapper,
		openPanelWithMessage,
	} = useAssist();
	const elementRef = useRef<HTMLElement | null>(null);
	const scheduleBubbleUpdateRef = useRef<null | (() => void)>(null);
	const bubbleResizeObserverRef = useRef<ResizeObserver | null>(null);
	const [bubblePos, setBubblePos] = useState<{
		top: number;
		left: number;
		visible: boolean;
	}>({ top: 0, left: 0, visible: false });

	const bubbleMessage = useMemo(
		() => buildMarkerPrompt({ id, label, intent }),
		[id, label, intent],
	);

	useEffect(() => {
		// Wait for element to be available
		const checkAndRegister = () => {
			if (elementRef.current) {
				registerMarker({
					id,
					label,
					intent,
					element: elementRef.current,
				});
			}
		};

		// Try immediately
		checkAndRegister();

		// Also try on next frame in case element isn't ready yet
		const raf = requestAnimationFrame(checkAndRegister);

		return () => {
			cancelAnimationFrame(raf);
			unregisterMarker(id);
		};
	}, [id, label, intent, registerMarker, unregisterMarker]);

	// Keep the bubble positioned near the marked element without changing layout
	useLayoutEffect(() => {
		if (!showAssistBubble) return;
		if (typeof window === "undefined") return;

		let raf = 0;

		const updatePosition = () => {
			const el = elementRef.current;
			if (!el) {
				setBubblePos((prev) =>
					prev.visible ? { ...prev, visible: false } : prev,
				);
				return;
			}

			const rect = el.getBoundingClientRect();
			const size = 22;
			const pad = 8;

			const inViewport =
				rect.width > 0 &&
				rect.height > 0 &&
				rect.bottom > 0 &&
				rect.right > 0 &&
				rect.top < window.innerHeight &&
				rect.left < window.innerWidth;

			if (!inViewport) {
				setBubblePos((prev) =>
					prev.visible ? { ...prev, visible: false } : prev,
				);
				return;
			}

			const top = Math.min(
				window.innerHeight - size - pad,
				Math.max(pad, rect.top - size / 2),
			);
			const left = Math.min(
				window.innerWidth - size - pad,
				Math.max(pad, rect.right - size / 2),
			);

			setBubblePos({ top, left, visible: true });
		};

		const scheduleUpdate = () => {
			if (raf) return;
			raf = window.requestAnimationFrame(() => {
				raf = 0;
				updatePosition();
			});
		};

		scheduleBubbleUpdateRef.current = scheduleUpdate;

		// Initial position
		updatePosition();

		// Track scroll/resize across the document (capture catches scroll on containers)
		window.addEventListener("scroll", scheduleUpdate, true);
		window.addEventListener("resize", scheduleUpdate);

		// Track element resizes
		if ("ResizeObserver" in window) {
			const resizeObserver = new ResizeObserver(scheduleUpdate);
			bubbleResizeObserverRef.current = resizeObserver;
			if (elementRef.current) {
				resizeObserver.observe(elementRef.current);
			}
		}

		return () => {
			window.removeEventListener("scroll", scheduleUpdate, true);
			window.removeEventListener("resize", scheduleUpdate);
			scheduleBubbleUpdateRef.current = null;
			bubbleResizeObserverRef.current?.disconnect();
			bubbleResizeObserverRef.current = null;
			if (raf) window.cancelAnimationFrame(raf);
		};
	}, [showAssistBubble]);

	// Clone the child element and attach ref
	const childWithRef = React.cloneElement(children, {
		ref: (node: HTMLElement | null) => {
			const previous = elementRef.current;
			elementRef.current = node;
			if (showAssistBubble && node && bubbleResizeObserverRef.current) {
				// Ensure the ResizeObserver starts tracking once the element exists
				if (previous && previous !== node) {
					bubbleResizeObserverRef.current.unobserve(previous);
				}
				bubbleResizeObserverRef.current.observe(node);
			}
			// Ensure bubble shows up immediately once ref attaches
			scheduleBubbleUpdateRef.current?.();
			// Preserve original ref if it exists
			const originalRef = (children as any).ref;
			if (typeof originalRef === "function") {
				originalRef(node);
			} else if (originalRef) {
				originalRef.current = node;
			}
		},
	});

	// Check if this marker is currently highlighted and we have a wrapper component
	const isHighlighted = highlightedMarkers.has(id);

	// If highlighted with a wrapper component, wrap the children
	if (isHighlighted && highlightWrapper) {
		const HighlightWrapper = highlightWrapper;
		return (
			<>
				<HighlightWrapper markerId={id}>{childWithRef}</HighlightWrapper>
				{showAssistBubble &&
					bubblePos.visible &&
					typeof document !== "undefined" &&
					createPortal(
						<button
							type="button"
							aria-label={`Ask assistant about ${label || id}`}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								openPanelWithMessage(bubbleMessage);
							}}
							style={{
								position: "fixed",
								top: bubblePos.top,
								left: bubblePos.left,
								width: 22,
								height: 22,
								borderRadius: 9999,
								border: "1px solid rgba(255,255,255,0.18)",
								background: "rgba(15, 23, 42, 0.92)", // slate-900-ish
								color: "white",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								boxShadow:
									"0 10px 20px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.18)",
								zIndex: 2147483647,
								cursor: "pointer",
								padding: 0,
							}}
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									d="M20 12c0 3.866-3.582 7-8 7a9.8 9.8 0 0 1-2.4-.296L5 20l.98-3.1C4.734 15.66 4 13.9 4 12c0-3.866 3.582-7 8-7s8 3.134 8 7Z"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinejoin="round"
								/>
								<path
									d="M8 12h.01M12 12h.01M16 12h.01"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						</button>,
						document.body,
					)}
			</>
		);
	}

	return (
		<>
			{childWithRef}
			{showAssistBubble &&
				bubblePos.visible &&
				typeof document !== "undefined" &&
				createPortal(
					<button
						type="button"
						aria-label={`Ask assistant about ${label || id}`}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							openPanelWithMessage(bubbleMessage);
						}}
						style={{
							position: "fixed",
							top: bubblePos.top,
							left: bubblePos.left,
							width: 22,
							height: 22,
							borderRadius: 9999,
							border: "1px solid rgba(255,255,255,0.18)",
							background: "rgba(15, 23, 42, 0.92)", // slate-900-ish
							color: "white",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow:
								"0 10px 20px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.18)",
							zIndex: 100,
							cursor: "pointer",
							padding: 0,
						}}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								d="M20 12c0 3.866-3.582 7-8 7a9.8 9.8 0 0 1-2.4-.296L5 20l.98-3.1C4.734 15.66 4 13.9 4 12c0-3.866 3.582-7 8-7s8 3.134 8 7Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinejoin="round"
							/>
							<path
								d="M8 12h.01M12 12h.01M16 12h.01"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							/>
						</svg>
					</button>,
					document.body,
				)}
		</>
	);
}
