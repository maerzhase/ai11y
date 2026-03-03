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
			"Click an interactive element (link, button, etc.) by its marker ID. When the marker is in inViewMarkerIds use only 'ai11y_click'. When the marker is NOT in inViewMarkerIds you MUST call 'ai11y_scroll' first then 'ai11y_click' — both calls required. Never omit the click when the user asked to click.",
		parameters: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description:
						"The marker ID of the element to click. If NOT in inViewMarkerIds, you must call 'ai11y_scroll' with this id first, then 'ai11y_click' with this same id — two tool calls.",
				},
			},
			required: ["id"],
		},
	},
	{
		name: "ai11y_fillInput",
		description:
			"Fill a form field (input, textarea, or select) with a value by its marker ID. Emits native browser events to trigger React onChange handlers and form validation. For select elements, the value should match one of the available option values. IMPORTANT: Do NOT fill password fields — politely inform the user that sending passwords over the wire is a security risk and they should enter it manually.",
		parameters: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description:
						"The marker ID of the input/textarea/select element to fill.",
				},
				value: {
					type: "string",
					description:
						"The value to fill the field with. For select elements, this must match one of the available option values.",
				},
			},
			required: ["id", "value"],
		},
	},
	{
		name: "ai11y_navigate",
		description:
			"Navigate to a different route/page using a route path (e.g., '/billing', '/integrations'). Use only when 'navigate to [X]' refers to a route path, not a UI element. If X matches a marker, use 'ai11y_scroll' instead (navigate to element = scroll to it).",
		parameters: {
			type: "object",
			properties: {
				route: {
					type: "string",
					description:
						"The route path to navigate to (e.g., '/billing', '/integrations', '/').",
				},
			},
			required: ["route"],
		},
	},
	{
		name: "ai11y_scroll",
		description:
			"Scroll to a UI element by its marker ID to bring it into view. Use when user only wants to see/navigate to an element (single scroll). When user asked to CLICK or interact and the element is not in view: you MUST call ai11y_scroll first AND then call the action tool in the same response — never scroll only when they asked for an action. For relative scrolling ('scroll to next'/'previous'): skip markers in inViewMarkerIds.",
		parameters: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description:
						"The marker ID of the element to scroll to. If user asked to click/interact, you must also call the action tool after this scroll in the same response.",
				},
			},
			required: ["id"],
		},
	},
	{
		name: "ai11y_highlight",
		description:
			"Highlight a UI element by its marker ID to draw the user's attention. This will also scroll the element into view. The highlight typically fades after a few seconds.",
		parameters: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "The marker ID of the element to highlight.",
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
