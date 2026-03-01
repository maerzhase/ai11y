/**
 * @ai11y/core
 *
 * Provides declarative tool definitions for ai11y capabilities.
 * Fully compatible with MCP (Model Context Protocol) tool schema.
 * Used by client-side WebMCP registration and server-side agent.
 *
 * @packageDocumentation
 */

import type { InputSchema } from "@mcp-b/webmcp-types";

/**
 * ai11y tool definition
 *
 * @remarks
 * Fully MCP-compatible tool definition using InputSchema for parameters.
 * Follows the Model Context Protocol tool specification.
 *
 * @example
 * ```typescript
 * const tool: Ai11yTool = {
 *   name: "ai11y_click",
 *   description: "Click an element by its ID",
 *   parameters: {
 *     type: "object",
 *     properties: {
 *       id: { type: "string", description: "Element ID" }
 *     },
 *     required: ["id"]
 *   }
 * };
 * ```
 */
export interface Ai11yTool {
	/** Tool name with ai11y_ prefix */
	name: string;
	/** Human-readable description of the tool's purpose */
	description: string;
	/** JSON Schema for tool input parameters (MCP compatible) */
	parameters: InputSchema;
}

/**
 * Pre-defined ai11y tools
 *
 * @remarks
 * These tools are used for:
 * - Client-side: WebMCP tool registration via navigator.modelContext
 * - Server-side: System prompt generation for the agent
 *
 * Each tool follows the ai11y_ naming convention and uses MCP-compatible
 * InputSchema for parameter definitions.
 */
export const ai11yTools: Ai11yTool[] = [
	{
		name: "ai11y_describe",
		description:
			"Get the current UI context including all markers (interactive elements), route, state, and page information. Call this first to understand what actions are available on the page.",
		parameters: {
			type: "object",
			properties: {
				level: {
					type: "string",
					enum: ["markers", "interactive", "full"],
					description:
						"Context level: 'markers' returns explicitly marked elements, 'interactive' returns all clickable/fillable elements, 'full' returns complete page structure.",
				},
				rootSelector: {
					type: "string",
					description:
						"Optional CSS selector to scope context to a specific DOM subtree.",
				},
			},
		},
	},
	{
		name: "ai11y_click",
		description:
			"Click an interactive element on the page by its marker ID. Use this to activate buttons, toggles, switches, or other clickable elements. Returns confirmation once the click is dispatched.",
		parameters: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description:
						"The unique marker ID of the element to click (e.g., 'theme_toggle', 'nav_route_billing', 'click_demo_increment')",
				},
			},
			required: ["id"],
		},
	},
	{
		name: "ai11y_fillInput",
		description:
			"Fill a text input, textarea, or select element with a specific value. Use this for form inputs like email, password, search fields, or any editable text area.",
		parameters: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description:
						"The unique marker ID of the input element (e.g., 'fill_demo_email', 'fill_demo_password')",
				},
				value: {
					type: "string",
					description: "The text value to fill into the input field",
				},
			},
			required: ["id", "value"],
		},
	},
	{
		name: "ai11y_navigate",
		description:
			"Navigate to a different route within the application. Use this when the user wants to go to a different page or section of the app.",
		parameters: {
			type: "object",
			properties: {
				route: {
					type: "string",
					description:
						"The path to navigate to (e.g., '/', '/billing', '/integrations')",
				},
			},
			required: ["route"],
		},
	},
	{
		name: "ai11y_scroll",
		description:
			"Scroll the viewport to bring a specific element into view. Use this when the user wants to focus on or reveal content that is not currently visible.",
		parameters: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description:
						"The unique marker ID of the element to scroll to (e.g., 'slide_navigation', 'highlight_demo_badge_1')",
				},
			},
			required: ["id"],
		},
	},
	{
		name: "ai11y_highlight",
		description:
			"Temporarily highlight an element on the page to draw attention to it. The highlight typically fades after a few seconds. Useful for confirming an element's location or for visual feedback.",
		parameters: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description:
						"The unique marker ID of the element to highlight (e.g., 'hero_title', 'context_panel_toggle')",
				},
			},
			required: ["id"],
		},
	},
	{
		name: "ai11y_setState",
		description:
			"Update the application state that is shared with AI agents. Use this to store context about user preferences, session data, or any custom state that should be included in future context descriptions.",
		parameters: {
			type: "object",
			properties: {
				state: {
					type: "object",
					description:
						"A JSON object containing state key-value pairs to merge with existing state",
				},
			},
			required: ["state"],
		},
	},
	{
		name: "ai11y_getState",
		description:
			"Retrieve the current application state that is shared with AI agents. Use this to understand any custom state that has been set via setState.",
		parameters: {
			type: "object",
			properties: {},
		},
	},
];

/**
 * Retrieves a tool definition by name
 *
 * @param name - Tool name to look up
 * @returns The tool definition if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const tool = getToolByName("ai11y_click");
 * if (tool) {
 *   console.log(tool.description);
 * }
 * ```
 */
export function getToolByName(name: string): Ai11yTool | undefined {
	return ai11yTools.find((tool) => tool.name === name);
}

/**
 * @deprecated Use {@link ai11yTools} instead
 */
export const openAITools = ai11yTools;
