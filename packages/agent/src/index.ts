import { planWithOpenAI } from "./lib/openai.js";
import { generateSystemPrompt } from "./lib/prompt.js";
import type { AgentConfig, PlanRequest, PlanResponse } from "./types.js";

export function createAgent(config: AgentConfig) {
	const {
		apiKey,
		provider = "openai",
		model = "gpt-4o-mini",
		baseURL,
		temperature = 0,
	} = config;

	const systemPrompt = generateSystemPrompt();

	async function plan(request: PlanRequest): Promise<PlanResponse> {
		const { message, context, history = [] } = request;

		const contextMessage = `Current page context:
- Route: ${context.route || "/"}
- Markers (${context.markers?.length || 0}):
${context.markers?.map((m) => `  - ${m.id}: ${m.label} (${m.elementType})`).join("\n") || "  (none)"}

${context.state ? `- State: ${JSON.stringify(context.state)}` : ""}`;

		if (provider === "openai") {
			return planWithOpenAI({
				apiKey,
				model,
				baseURL,
				temperature,
				message,
				contextMessage,
				history,
				systemPrompt,
			});
		}

		throw new Error(`Provider ${provider} not supported yet`);
	}

	return { plan };
}

export type {
	AgentConfig,
	Instruction,
	PlanRequest,
	PlanResponse,
} from "./types.js";
