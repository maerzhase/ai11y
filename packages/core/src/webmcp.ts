import type { InputSchema } from "@mcp-b/webmcp-types";
import { clickMarker } from "./dom-actions/click.js";
import { fillInputMarker } from "./dom-actions/fill-input.js";
import { highlightMarker } from "./dom-actions/highlight.js";
import { navigateToRoute } from "./dom-actions/navigate.js";
import { scrollToMarker } from "./dom-actions/scroll.js";
import { getState, setRoute, setState } from "./store.js";
import { openAITools } from "./tool-schemas.js";

function createToolResult(text: string) {
	return {
		content: [{ type: "text" as const, text }],
	};
}

function createToolExecutor(action: string) {
	return async (args: Record<string, unknown>) => {
		switch (action) {
			case "describe": {
				const { level, rootSelector } = args as {
					level?: string;
					rootSelector?: string;
				};
				const root = rootSelector
					? (document.querySelector(rootSelector) as Element | undefined)
					: undefined;
				const { getContext } = await import("./dom.js");
				const context = getContext(
					root,
					(level as "markers" | "interactive" | "full") || "markers",
				);
				return createToolResult(JSON.stringify(context, null, 2));
			}
			case "click": {
				const { id } = args as { id: string };
				clickMarker(id);
				return createToolResult(`Clicked element with marker id: ${id}`);
			}
			case "fillInput": {
				const { id, value } = args as { id: string; value: string };
				fillInputMarker(id, value);
				return createToolResult(
					`Filled input '${id}' with value: ${JSON.stringify(value)}`,
				);
			}
			case "navigate": {
				const { route } = args as { route: string };
				setRoute(route);
				navigateToRoute(route);
				return createToolResult(`Navigated to route: ${route}`);
			}
			case "scroll": {
				const { id } = args as { id: string };
				scrollToMarker(id);
				return createToolResult(`Scrolled to element with marker id: ${id}`);
			}
			case "highlight": {
				const { id } = args as { id: string };
				highlightMarker(id);
				return createToolResult(
					`Highlighted element with marker id: ${id} (highlight will fade)`,
				);
			}
			case "setState": {
				const { state } = args as { state: Record<string, unknown> };
				setState(state);
				return createToolResult(`State updated: ${JSON.stringify(state)}`);
			}
			case "getState": {
				const state = getState();
				return createToolResult(JSON.stringify(state, null, 2));
			}
			default:
				return createToolResult(`Unknown action: ${action}`);
		}
	};
}

function initWebMCP() {
	if (typeof navigator === "undefined") return;
	if (typeof navigator.modelContext === "undefined") {
		return;
	}

	for (const tool of openAITools) {
		const actionName = tool.name.replace("ai11y_", "");
		navigator.modelContext.registerTool({
			name: tool.name,
			description: tool.description,
			inputSchema: tool.parameters as InputSchema,
			execute: createToolExecutor(actionName),
		});
	}
}

initWebMCP();
