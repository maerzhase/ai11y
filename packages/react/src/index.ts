// Re-export core API

// Re-export types from core
export type {
	AgentConfig,
	AgentMode,
	AgentResponse,
	Ai11yContext,
	Ai11yError,
	Ai11yEvent,
	Ai11yState,
	LLMAgentConfig,
	Marker as MarkerType,
} from "@ai11y/core";
export {
	type Ai11yClient,
	createClient,
	getContext,
	type Instruction,
	plan,
} from "@ai11y/core";
export { Ai11yProvider } from "./components/Ai11yProvider.js";
export { Marker } from "./components/Marker.js";
export { useAi11yContext } from "./hooks/useAi11yContext.js";
export { useChat } from "./hooks/useChat.js";
