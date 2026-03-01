export interface OpenAIFunction {
	name: string;
	description: string;
	parameters: {
		type: "object";
		properties: Record<string, unknown>;
		required?: string[];
	};
	actionFormat?: {
		action: string;
		requiredFields: string[];
		example: Record<string, string>;
	};
}

export const openAITools: OpenAIFunction[] = [
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
					default: "markers",
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
		actionFormat: {
			action: "describe",
			requiredFields: [],
			example: {},
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
		actionFormat: {
			action: "click",
			requiredFields: ["id"],
			example: { id: "theme_toggle" },
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
		actionFormat: {
			action: "fillInput",
			requiredFields: ["id", "value"],
			example: { id: "fill_demo_email", value: "test@example.com" },
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
		actionFormat: {
			action: "navigate",
			requiredFields: ["route"],
			example: { route: "/billing" },
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
		actionFormat: {
			action: "scroll",
			requiredFields: ["id"],
			example: { id: "slide_navigation" },
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
		actionFormat: {
			action: "highlight",
			requiredFields: ["id"],
			example: { id: "hero_title" },
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
		actionFormat: {
			action: "setState",
			requiredFields: ["state"],
			example: { state: '{"theme": "dark"}' },
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
		actionFormat: {
			action: "getState",
			requiredFields: [],
			example: {},
		},
	},
];

export function getToolByName(name: string): OpenAIFunction | undefined {
	return openAITools.find((tool) => tool.name === name);
}
