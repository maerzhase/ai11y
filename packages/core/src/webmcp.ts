/**
 * @ai11y/core WebMCP integration
 *
 * Registers ai11y tools with the WebMCP (Model Context Protocol) API.
 * Enables browser-based AI assistants to interact with the page through
 * the navigator.modelContext interface.
 *
 * @module
 * @remarks
 * This module automatically registers all ai11y tools when loaded in a browser
 * environment that supports the WebMCP API (navigator.modelContext).
 *
 * Tools are registered with the ai11y_ prefix for clarity and to avoid
 * conflicts with other MCP tools.
 *
 * @example
 * ```typescript
 * // Tools are automatically registered when this module is imported
 * import "@ai11y/core/webmcp";
 * ```
 *
 * @requires navigator.modelContext (WebMCP API)
 * @see https://modelcontextprotocol.io/
 */

import type { InputSchema } from "@mcp-b/webmcp-types";
import { clickMarker } from "./dom-actions/click.js";
import { fillInputMarker } from "./dom-actions/fill-input.js";
import { highlightMarker } from "./dom-actions/highlight.js";
import { navigateToRoute } from "./dom-actions/navigate.js";
import { scrollToMarker } from "./dom-actions/scroll.js";
import { getState, setRoute, setState } from "./store.js";
import { ai11yTools } from "./tool-schemas.js";

/**
 * Creates a WebMCP-compatible tool result
 * @param text - Result text to return to the LLM
 * @returns Formatted tool result object
 */
function createToolResult(text: string) {
	return {
		content: [{ type: "text" as const, text }],
	};
}

/**
 * Creates an executor function for a specific action
 * @param action - Action name to execute
 * @returns Async function that executes the action with provided args
 *
 * @internal
 */
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

/**
 * Initializes WebMCP tool registration
 *
 * @remarks
 * This function:
 * 1. Checks if running in a browser environment
 * 2. Verifies navigator.modelContext is available
 * 3. Registers all ai11y tools with the WebMCP API
 *
 * Called automatically when the module is loaded.
 */
function initWebMCP(): void {
	console.log("[ai11y] initWebMCP starting...", {
		hasNavigator: typeof navigator !== "undefined",
		hasModelContext:
			typeof navigator !== "undefined" &&
			typeof navigator.modelContext !== "undefined",
	});
	if (typeof navigator === "undefined") {
		console.log("[ai11y] No navigator - skipping WebMCP init");
		return;
	}
	if (typeof navigator.modelContext === "undefined") {
		console.log("[ai11y] No navigator.modelContext - skipping WebMCP init");
		return;
	}

	console.log(
		"[ai11y] Registering tools:",
		ai11yTools.map((t) => t.name),
	);
	for (const tool of ai11yTools) {
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
