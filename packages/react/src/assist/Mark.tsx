import React, { useEffect, useRef } from "react";
import { useAssist } from "./AssistProvider";

interface MarkProps {
	id: string;
	label: string;
	intent: string;
	children: React.ReactElement;
}

export function Mark({ id, label, intent, children }: MarkProps) {
	const { registerMarker, unregisterMarker, highlightedMarkers, highlightWrapper } =
		useAssist();
	const elementRef = useRef<HTMLElement | null>(null);

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

	// Clone the child element and attach ref
	const childWithRef = React.cloneElement(children, {
		ref: (node: HTMLElement | null) => {
			elementRef.current = node;
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
		return <HighlightWrapper markerId={id}>{childWithRef}</HighlightWrapper>;
	}

	return childWithRef;
}
