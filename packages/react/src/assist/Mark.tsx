import {
	ATTRIBUTE_ID,
	ATTRIBUTE_INTENT,
	ATTRIBUTE_LABEL,
	formatMarkerId,
} from "@quest/core";
import { MorphingBlob } from "@quest/ui";
import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
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

	if (safeIntent) {
		return `Tell me about "${safeLabel}" - ${safeIntent}`;
	}
	return `Tell me about "${safeLabel}"`;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
	if (!ref) return;
	if (typeof ref === "function") {
		ref(value);
		return;
	}
	try {
		(ref as React.MutableRefObject<T | null>).current = value;
	} catch {
		// ignore read-only refs
	}
}

const useIsomorphicLayoutEffect =
	typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
		togglePanelForMarker,
		focusedMarkerId,
	} = useAssist();

	const isFocused = focusedMarkerId === id;
	const isHighlighted = highlightedMarkers.has(id);
	const elementRef = useRef<HTMLElement | null>(null);
	const bubbleRef = useRef<HTMLButtonElement | null>(null);

	const bubbleMessage = useMemo(
		() => buildMarkerPrompt({ id, label, intent }),
		[id, label, intent],
	);

	// Register marker
	useEffect(() => {
		if (!elementRef.current) return;
		registerMarker({
			id,
			label,
			intent,
			element: elementRef.current,
		});

		return () => {
			unregisterMarker(id);
		};
		// Note: we intentionally re-run this effect when highlight wrapping changes.
		// Conditional wrapping can remount the underlying DOM node; we need the registry
		// to point at the current element so tools like `click()` still work.
	}, [id, label, intent, registerMarker, unregisterMarker]);

	// Update bubble position directly via ref (no state updates during scroll)
	useIsomorphicLayoutEffect(() => {
		if (!showAssistBubble) return;

		const updatePosition = () => {
			const el = elementRef.current;
			const bubble = bubbleRef.current;
			if (!el || !bubble) return;
			const rect = el.getBoundingClientRect();
			bubble.style.top = `${rect.bottom - 12}px`;
			bubble.style.left = `${rect.right - 12}px`;
		};

		updatePosition();

		window.addEventListener("scroll", updatePosition, true);
		window.addEventListener("resize", updatePosition);

		return () => {
			window.removeEventListener("scroll", updatePosition, true);
			window.removeEventListener("resize", updatePosition);
		};
	}, [showAssistBubble, isHighlighted, highlightWrapper]);

	// Clone child and attach ref + data-ai-* attributes (no wrapper needed)
	const childWithRef = React.cloneElement(children, {
		ref: (node: HTMLElement | null) => {
			elementRef.current = node;
			assignRef((children as any).ref, node);
		},
		[ATTRIBUTE_ID]: id,
		...(label && { [ATTRIBUTE_LABEL]: label }),
		...(intent && { [ATTRIBUTE_INTENT]: intent }),
	} as any);

	const handleBubbleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		togglePanelForMarker(id, bubbleMessage);
	};

	const isEmphasized = isFocused || isHighlighted;

	const canShowBubble =
		showAssistBubble &&
		typeof document !== "undefined" &&
		typeof document.body !== "undefined";

	const bubble =
		canShowBubble &&
		createPortal(
			<button
				ref={bubbleRef}
				type="button"
				aria-label={`Ask assistant about ${label || id}`}
				onClick={handleBubbleClick}
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					zIndex: isHighlighted ? 2147483647 : 100,
					cursor: "pointer",
					padding: 0,
					background: "none",
					border: "none",
					color: isEmphasized ? "hsl(200, 80%, 50%)" : "white",
					filter: isEmphasized
						? "drop-shadow(0 0 6px hsl(200, 80%, 50%))"
						: "none",
					transform: isEmphasized ? "scale(1.1)" : "scale(1)",
					transition:
						"transform 0.15s ease, color 0.15s ease, filter 0.15s ease",
				}}
				className="hover:scale-110 active:scale-95"
			>
				<MorphingBlob size={24} duration={isEmphasized ? 4 : 8}>
					<svg
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						style={{ color: "rgb(15, 23, 42)" }}
					>
						<circle cx="8" cy="10" r="2" fill="currentColor" />
						<circle cx="16" cy="10" r="2" fill="currentColor" />
						<path
							d="M8 15c1.5 2 6.5 2 8 0"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</svg>
				</MorphingBlob>
			</button>,
			document.body,
		);

	if (isHighlighted && highlightWrapper) {
		const HighlightWrapper = highlightWrapper;
		return (
			<>
				<HighlightWrapper markerId={id}>{childWithRef}</HighlightWrapper>
				{bubble}
			</>
		);
	}

	return (
		<>
			{childWithRef}
			{bubble}
		</>
	);
}
