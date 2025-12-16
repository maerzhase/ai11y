import React, { useEffect, useRef } from "react";
import { useAssist } from "./AssistProvider";

interface MarkProps {
	id: string;
	label: string;
	intent: string;
	action?: () => void;
	children: React.ReactElement;
}

export function Mark({ id, label, intent, action, children }: MarkProps) {
	const { registerMarker, unregisterMarker } = useAssist();
	const elementRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		// Wait for element to be available
		const checkAndRegister = () => {
			if (elementRef.current) {
				registerMarker({
					id,
					label,
					intent,
					action,
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
	}, [id, label, intent, action, registerMarker, unregisterMarker]);

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

	return childWithRef;
}

