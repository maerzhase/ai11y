import type { ConversationMessage } from "@quest/core";
import type { AgentResponse, ToolCall, UIAIContext } from "./types";

/**
 * Simple dummy agent for offline or test environments.
 * Supports tool calls (navigate, click, highlight, scroll) similar to rule-based agent
 * but designed for testing and offline scenarios.
 */
export function runDummyAgent(
	input: string,
	context: UIAIContext,
	messages?: ConversationMessage[],
): AgentResponse {
	const lowerInput = input.toLowerCase().trim();

	// Handle navigation commands
	if (
		lowerInput.includes("go to") ||
		lowerInput.includes("navigate to") ||
		lowerInput.includes("open") ||
		lowerInput.includes("take me to")
	) {
		const toolCalls: ToolCall[] = [];

		// Extract route from input
		let route = "/";
		if (lowerInput.includes("billing")) {
			route = "/billing";
		} else if (lowerInput.includes("integrations")) {
			route = "/integrations";
		} else if (lowerInput.includes("home")) {
			route = "/";
		} else {
			// Try to find a marker that matches
			const matchingMarker = context.markers.find(
				(m) =>
					lowerInput.includes(m.label.toLowerCase()) ||
					lowerInput.includes(m.intent.toLowerCase()),
			);
			if (matchingMarker) {
				// If it's a navigation marker, extract route from intent
				if (matchingMarker.intent.toLowerCase().includes("billing")) {
					route = "/billing";
				} else if (
					matchingMarker.intent.toLowerCase().includes("integrations")
				) {
					route = "/integrations";
				}
			}
		}

		if (route !== context.route) {
			toolCalls.push({ type: "navigate", route });
			return {
				reply: `[Offline Mode] Navigating to ${route === "/" ? "home" : route}...`,
				toolCalls,
			};
		} else {
			return {
				reply: `[Offline Mode] You're already on ${route === "/" ? "home" : route}.`,
			};
		}
	}

	// Handle click commands
	if (lowerInput.includes("click") || lowerInput.includes("press")) {
		// Find matching marker
		const matchingMarker = context.markers.find((m) => {
			const markerText = `${m.label} ${m.intent}`.toLowerCase();
			return (
				markerText.includes(lowerInput.replace(/click|press/g, "").trim()) ||
				lowerInput.includes(m.label.toLowerCase()) ||
				lowerInput.includes(m.intent.toLowerCase())
			);
		});

		if (matchingMarker) {
			return {
				reply: `[Offline Mode] Clicking ${matchingMarker.label}...`,
				toolCalls: [{ type: "click", markerId: matchingMarker.id }],
			};
		} else {
			return {
				reply: `[Offline Mode] I couldn't find a button or element matching "${input}". Available options: ${context.markers.map((m) => m.label).join(", ") || "none"}`,
			};
		}
	}

	// Handle scroll commands
	if (
		lowerInput.includes("scroll to") ||
		(lowerInput.includes("scroll") && !lowerInput.includes("highlight"))
	) {
		const matchingMarker = context.markers.find((m) => {
			const markerText = `${m.label} ${m.intent}`.toLowerCase();
			const searchText = lowerInput.replace(/scroll to|scroll/g, "").trim();
			return (
				markerText.includes(searchText) ||
				lowerInput.includes(m.label.toLowerCase())
			);
		});

		if (matchingMarker) {
			return {
				reply: `[Offline Mode] Scrolling to ${matchingMarker.label}...`,
				toolCalls: [{ type: "scroll", markerId: matchingMarker.id }],
			};
		}
	}

	// Handle highlight commands
	if (lowerInput.includes("highlight") || lowerInput.includes("show")) {
		const matchingMarker = context.markers.find((m) => {
			const markerText = `${m.label} ${m.intent}`.toLowerCase();
			return (
				markerText.includes(
					lowerInput.replace(/highlight|show/g, "").trim(),
				) || lowerInput.includes(m.label.toLowerCase())
			);
		});

		if (matchingMarker) {
			return {
				reply: `[Offline Mode] Highlighting ${matchingMarker.label}...`,
				toolCalls: [{ type: "highlight", markerId: matchingMarker.id }],
			};
		}
	}

	// Handle error context
	if (context.error) {
		const error = context.error.error;
		const errorMessage = error.message || "An error occurred";

		if (
			lowerInput.includes("retry") ||
			lowerInput.includes("try again") ||
			lowerInput.includes("fix")
		) {
			// Try to find a retry action
			if (context.error.meta?.markerId) {
				const marker = context.markers.find(
					(m) => m.id === context.error?.meta?.markerId,
				);
				if (marker) {
					return {
						reply: `[Offline Mode] Retrying ${marker.label}...`,
						toolCalls: [{ type: "click", markerId: marker.id }],
					};
				}
			}

			return {
				reply: `[Offline Mode] I can help you retry. The error was: ${errorMessage}. Would you like me to try clicking the button again?`,
			};
		}

		return {
			reply: `[Offline Mode] I noticed an error: ${errorMessage}. You can ask me to "retry" or "try again" to attempt the action once more.`,
		};
	}

	// Help command
	if (
		lowerInput.includes("help") ||
		lowerInput.includes("what can you do") ||
		lowerInput.length === 0
	) {
		const markerCount = context.markers.length;
		const availableMarkers = context.markers
			.slice(0, 10)
			.map((m) => `${m.label} (id: ${m.id})`)
			.join(", ");
		const moreText = markerCount > 10 ? ` and ${markerCount - 10} more` : "";

		return {
			reply: `[Offline Mode] I can help with navigation and interactions. Currently ${markerCount} element${markerCount !== 1 ? "s are" : " is"} available${markerCount > 0 ? `: ${availableMarkers}${moreText}` : ""}. Try commands like:\n- "navigate to [route]" or "go to [route]"\n- "click [element name]" or "press [element name]"\n- "highlight [element name]" or "show [element name]"\n- "scroll to [element name]"`,
		};
	}

	// Default response with available markers
	const markerCount = context.markers.length;
	if (markerCount > 0) {
		const markerList = context.markers
			.map((m) => `"${m.label}" (${m.id})`)
			.join(", ");
		return {
			reply: `[Offline Mode] I received: "${input}". Available markers: ${markerList}. Try commands like "click [marker name]", "navigate to [route]", or "highlight [marker name]".`,
		};
	}

	return {
		reply: `[Offline Mode] I received: "${input}". No markers are currently available. Try commands like "navigate to [route]" for navigation.`,
	};
}

