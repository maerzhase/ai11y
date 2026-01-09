/**
 * Agent module - provides different agent implementations
 *
 * Agents:
 * - runRuleBasedAgent: Pattern-matching agent for common commands (works offline)
 * - runLLMAgent: LLM-based agent using server-side API
 * - runAgentAdapter: Unified adapter that selects the appropriate agent
 */

export { runRuleBasedAgent } from "./rule-based-agent.js";
export { runLLMAgent } from "./llm-agent.js";
export { runAgentAdapter } from "./agent-adapter.js";
export type {
	AgentAdapterConfig,
	AgentConfig,
	AgentMode,
	LLMAgentConfig,
} from "./types.js";
