// Re-export core API
export {
	createClient,
	plan,
	getContext,
	type Instruction,
	type UIAIClient,
} from "@ui4ai/core";

// React components
export { Marker } from "./components/Marker.js";
export { UIAIProvider } from "./components/UIAIProvider.js";
export { Panel } from "./components/Panel.js";

// React hooks
export { useUIAIContext } from "./hooks/useUIAIContext.js";
export { useChat } from "./hooks/useChat.js";

// Re-export types from core
export type {
	AgentConfig,
	AgentMode,
	AgentResponse,
	LLMAgentConfig,
	Marker as MarkerType,
	UIAIContext,
	UIAIError,
	UIAIEvent,
	UIAIState,
} from "@ui4ai/core";
