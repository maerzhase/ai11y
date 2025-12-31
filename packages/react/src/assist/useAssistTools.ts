import {
	clickMarker,
	highlightMarker,
	navigateToRoute,
	scrollToMarker,
} from "@quest/core";
import { useCallback } from "react";
import { useAssist } from "./AssistProvider";

/**
 * Hook that provides React-specific wrappers around core tool functions.
 * These wrappers integrate with React-specific features like:
 * - highlightWrapper component (for visual highlighting)
 * - onNavigate callback (for React Router integration)
 * - highlightedMarkers state (for bubble emphasis)
 *
 * For side effects when highlighting (analytics, logging), use the `onHighlight`
 * option in `highlightMarker()` from `@quest/core`.
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
	const { highlightedMarkers, addHighlight, highlightWrapper, onNavigate } =
		useAssist();

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
			// Skip default visual highlighting (wrapper handles it)
			if (highlightWrapper) {
				highlightMarker(markerId, {
					duration: 0, // Don't apply default highlight styles
				});
				return;
			}

			// Use core function for default highlighting behavior
			highlightMarker(markerId);
		},
		[highlightWrapper, addHighlight],
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
