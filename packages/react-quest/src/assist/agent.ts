import type { AgentResponse, AssistContext, ToolCall } from "./types";

export function runAgent(input: string, context: AssistContext): AgentResponse {
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
				} else if (matchingMarker.intent.toLowerCase().includes("integrations")) {
					route = "/integrations";
				}
			}
		}

		if (route !== context.currentRoute) {
			toolCalls.push({ type: "navigate", route });
			return {
				reply: `Navigating to ${route === "/" ? "home" : route}...`,
				toolCalls,
			};
		} else {
			return {
				reply: `You're already on ${route === "/" ? "home" : route}.`,
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
				reply: `Clicking ${matchingMarker.label}...`,
				toolCalls: [{ type: "click", markerId: matchingMarker.id }],
			};
		} else {
			return {
				reply: `I couldn't find a button or element matching "${input}". Available options: ${context.markers.map((m) => m.label).join(", ") || "none"}`,
			};
		}
	}

	// Handle highlight commands
	if (lowerInput.includes("highlight") || lowerInput.includes("show")) {
		const matchingMarker = context.markers.find((m) => {
			const markerText = `${m.label} ${m.intent}`.toLowerCase();
			return (
				markerText.includes(lowerInput.replace(/highlight|show/g, "").trim()) ||
				lowerInput.includes(m.label.toLowerCase())
			);
		});

		if (matchingMarker) {
			return {
				reply: `Highlighting ${matchingMarker.label}...`,
				toolCalls: [{ type: "highlight", markerId: matchingMarker.id }],
			};
		}
	}

	// Handle error context
	if (context.lastError) {
		const error = context.lastError.error;
		const errorMessage = error.message || "An error occurred";

		if (
			lowerInput.includes("retry") ||
			lowerInput.includes("try again") ||
			lowerInput.includes("fix")
		) {
			// Try to find a retry action
			if (context.lastError.meta?.markerId) {
				const marker = context.markers.find(
					(m) => m.id === context.lastError!.meta!.markerId,
				);
				if (marker) {
					return {
						reply: `Retrying ${marker.label}...`,
						toolCalls: [{ type: "click", markerId: marker.id }],
					};
				}
			}

			return {
				reply: `I can help you retry. The error was: ${errorMessage}. Would you like me to try clicking the button again?`,
			};
		}

		return {
			reply: `I noticed an error: ${errorMessage}. You can ask me to "retry" or "try again" to attempt the action once more.`,
		};
	}

	// Default response
	return {
		reply: `I can help you navigate, click buttons, or highlight elements. Try saying "go to billing", "click connect stripe", or "show me the enable billing button".`,
	};
}

