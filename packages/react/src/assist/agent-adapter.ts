import type { ConversationMessage } from "@quest/core";
import type {
	AgentMode,
	AgentResponse,
	LLMAgentConfig,
	UIAIContext,
} from "./types.js";
import { runAgent } from "./agent.js";
import { runDummyAgent } from "./dummy-agent.js";
import { runLLMAgent } from "./llm-agent.js";

/**
 * Configuration for agent selection
 */
export interface AgentAdapterConfig {
	/**
	 * Agent mode selection strategy
	 * - "llm": Always use LLM agent (requires llmConfig)
	 * - "rule-based": Always use rule-based agent
	 * - "dummy": Always use dummy agent (for testing/offline)
	 * - "auto": Use LLM if configured, fallback to rule-based on error, or dummy if explicitly offline
	 * @default "auto"
	 */
	mode?: AgentMode;

	/**
	 * LLM configuration (required for "llm" mode, optional for "auto")
	 */
	llmConfig?: LLMAgentConfig | null;

	/**
	 * Force offline mode (use dummy agent even if LLM config is available)
	 * @default false
	 */
	forceOffline?: boolean;

	/**
	 * Environment detection - automatically use dummy agent in test environments
	 * @default true
	 */
	useDummyInTest?: boolean;
}

/**
 * Detect if we're in a test environment
 */
function isTestEnvironment(): boolean {
	return (
		typeof process !== "undefined" &&
		(process.env.NODE_ENV === "test" ||
			process.env.VITEST === "true" ||
			process.env.JEST_WORKER_ID !== undefined ||
			typeof global !== "undefined" &&
				(global as any).__TEST__ === true)
	);
}

/**
 * Detect if we're likely offline (browser only)
 */
function isLikelyOffline(): boolean {
	if (typeof navigator !== "undefined" && "onLine" in navigator) {
		return !navigator.onLine;
	}
	return false;
}

/**
 * Select and run the appropriate agent based on configuration
 */
export async function runAgentAdapter(
	input: string,
	context: UIAIContext,
	config: AgentAdapterConfig = {},
	messages?: ConversationMessage[],
): Promise<AgentResponse> {
	const {
		mode = "auto",
		llmConfig = null,
		forceOffline = false,
		useDummyInTest = true,
	} = config;

	// Force dummy agent if explicitly requested or in test environment
	if (forceOffline || (useDummyInTest && isTestEnvironment())) {
		return runDummyAgent(input, context, messages);
	}

	// Explicit mode selection
	if (mode === "dummy") {
		return runDummyAgent(input, context, messages);
	}

	if (mode === "rule-based") {
		return runAgent(input, context);
	}

	if (mode === "llm") {
		if (!llmConfig) {
			console.warn(
				"LLM mode requested but no llmConfig provided. Falling back to rule-based agent.",
			);
			return runAgent(input, context);
		}
		return runLLMAgent(input, context, llmConfig, messages);
	}

	// Auto mode: try LLM if available, fallback to rule-based
	if (mode === "auto" || !mode) {
		// Check if we're offline
		if (isLikelyOffline()) {
			console.warn(
				"Device appears offline. Using dummy agent. Set forceOffline=false to override.",
			);
			return runDummyAgent(input, context, messages);
		}

		// Try LLM if configured
		if (llmConfig) {
			try {
				return await runLLMAgent(input, context, llmConfig, messages);
			} catch (error) {
				// runLLMAgent already falls back to rule-based, but we catch here for safety
				console.warn("LLM agent failed, using rule-based fallback:", error);
				return runAgent(input, context);
			}
		}

		// Default to rule-based
		return runAgent(input, context);
	}

	// Fallback (shouldn't reach here)
	return runAgent(input, context);
}

