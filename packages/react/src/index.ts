import type { Ai11yContext, DescribeLevel, Instruction } from "@ai11y/core";
import { act, getContext, setRoute, setState } from "@ai11y/core";

export type { Ai11yContext, DescribeLevel, Instruction };
export { act, getContext, getEvents, setRoute, setState } from "@ai11y/core";
export { Marker } from "./components/Marker.js";
export { useChat } from "./hooks/useChat.js";

export interface Ai11yEvent {
	type: string;
	payload?: unknown;
	timestamp: number;
}

export interface Ai11yError {
	error: { message: string };
	meta?: unknown;
	timestamp: number;
}

export function useAi11yContext() {
	console.warn(
		"@ai11y/react: useAi11yContext is deprecated. Use WebMCP tools instead.",
	);
	return {
		describe: (root?: Element, level?: DescribeLevel) =>
			getContext(root, level),
		act,
		track: () => {},
		getEvents: (): Ai11yEvent[] => [],
		setRoute,
		setState,
		lastError: null as Ai11yError | null,
		events: [] as Ai11yEvent[],
		agentConfig: undefined,
	};
}
