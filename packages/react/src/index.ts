// Re-export core API
export {
	createClient,
	plan,
	getContext,
	type Instruction,
	type Ai11yClient,
} from "@ai11y/core";

// React components
export { Marker } from "./components/Marker.js";
export { Ai11yProvider } from "./components/Ai11yProvider.js";
export { Panel } from "./components/Panel.js";

// React hooks
export { useAi11yContext } from "./hooks/useAi11yContext.js";
export { useChat } from "./hooks/useChat.js";

// Re-export types from core
export type {
	AgentConfig,
	AgentMode,
	AgentResponse,
	LLMAgentConfig,
	Marker as MarkerType,
	Ai11yContext,
	Ai11yError,
	Ai11yEvent,
	Ai11yState,
} from "@ai11y/core";
