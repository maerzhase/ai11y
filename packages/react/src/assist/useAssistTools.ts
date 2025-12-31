import { useCallback } from "react";
import {
	navigateToRoute,
	highlightMarker,
	scrollToMarker,
	clickMarker,
} from "@quest/core";
import { useAssist } from "./AssistProvider";

/**
 * Hook that provides React-specific wrappers around core tool functions.
 * These wrappers integrate with React-specific features like:
 * - highlightWrapper component
 * - onHighlight callback
 * - onNavigate callback
 * - highlightedMarkers state (for bubble emphasis)
 *
 * @example
 * ```tsx
 * const { navigate, highlight, scroll, click } = useAssistTools();
 * 
 * const handleAction = () => {
 *   navigate('/billing');
 *   highlight('connect_stripe');
 * };
 * ```
 */
export function useAssistTools() {
	const {
		highlightedMarkers,
		addHighlight,
		highlightWrapper,
		onHighlight,
		onNavigate,
	} = useAssist();

	const navigate = useCallback(
		(route: string) => {
			navigateToRoute(route);
			if (onNavigate) {
				onNavigate(route);
			}
		},
		[onNavigate],
	);

	const highlight = useCallback(
		(markerId: string) => {
			// Always add to highlightedMarkers (for bubble emphasis)
			addHighlight(markerId);

			// If highlightWrapper is provided, let it handle visual highlighting
			// In this case, we still need to scroll and call onHighlight
			if (highlightWrapper) {
				// Use core function but skip visual highlighting (wrapper handles it)
				highlightMarker(markerId, {
					onHighlight: onHighlight
						? (id: string, el: Element) => onHighlight(id, el as HTMLElement)
						: undefined,
					duration: 0, // Don't apply default highlight styles
				});
				return;
			}

			// Use core function for default highlighting behavior
			highlightMarker(markerId, {
				onHighlight: onHighlight
					? (id: string, el: Element) => onHighlight(id, el as HTMLElement)
					: undefined,
			});
		},
		[onHighlight, highlightWrapper, addHighlight],
	);

	const scroll = useCallback(
		(markerId: string) => {
			// Use core function (tracks event automatically)
			scrollToMarker(markerId);

			// Highlight the bubble when scrolling to marker
			addHighlight(markerId);
		},
		[addHighlight],
	);

	const click = useCallback((markerId: string) => {
		// Use core function (tracks event automatically)
		clickMarker(markerId);
	}, []);

	return {
		navigate,
		highlight,
		scroll,
		click,
	};
}

