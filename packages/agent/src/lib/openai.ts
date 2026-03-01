/**
 * OpenAI provider implementation for ai11y agent
 *
 * @module
 * @internal
 */

import type { Instruction, PlanResponse } from "../types.js";

/**
 * Parameters for the OpenAI planning function
 */
export interface OpenAIParams {
	/** OpenAI API key */
	apiKey: string;
	/** Model identifier (e.g., "gpt-4o-mini") */
	model: string;
	/** Optional base URL for OpenAI-compatible APIs */
	baseURL?: string;
	/** Sampling temperature (0-2) */
	temperature: number;
	/** Maximum tokens to generate */
	maxTokens?: number;
	/** User message to process */
	message: string;
	/** Formatted context message with page information */
	contextMessage: string;
	/** Conversation history */
	history: Array<{ role: "user" | "assistant"; content: string }>;
	/** System prompt with tool definitions */
	systemPrompt: string;
}

/**
 * Plans actions using OpenAI API
 *
 * @param params - OpenAI parameters including API key, model, messages
 * @returns Promise resolving to plan response with instructions
 *
 * @throws Error if no response is received from OpenAI
 *
 * @internal
 */
export async function planWithOpenAI(
	params: OpenAIParams,
): Promise<PlanResponse> {
	const {
		apiKey,
		model,
		baseURL,
		temperature,
		maxTokens,
		message,
		contextMessage,
		history,
		systemPrompt,
	} = params;

	const { OpenAI } = await import("openai");
	const openai = new OpenAI({
		apiKey,
		baseURL: baseURL || undefined,
	});

	const messages: Array<{
		role: "system" | "user" | "assistant";
		content: string;
	}> = [
		{ role: "system", content: systemPrompt },
		{ role: "system", content: contextMessage },
		...history.map((h) => ({
			role: h.role as "user" | "assistant",
			content: h.content,
		})),
		{ role: "user", content: message },
	];

	const response = await openai.chat.completions.create({
		model,
		messages,
		temperature,
		...(maxTokens && { max_tokens: maxTokens }),
	});

	const assistantMessage = response.choices[0]?.message;
	if (!assistantMessage) {
		throw new Error("No response from OpenAI");
	}

	const content = assistantMessage.content || "";
	return parseResponse(content);
}

/**
 * Parses the LLM response to extract instructions and reply
 *
 * @param content - Raw response content from the LLM
 * @returns Parsed response with instructions and reply
 *
 * @remarks
 * This function handles two response formats:
 * 1. Array format: `[{"action": "click", "id": "button"}]`
 * 2. Object format: `{"instructions": [...], "reply": "Done!"}`
 *
 * Any text outside the JSON is treated as the reply message.
 *
 * @internal
 */
function parseResponse(content: string): PlanResponse {
	let instructions: Instruction[] = [];
	let reply = content;

	try {
		const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
		if (jsonMatch) {
			const parsed = JSON.parse(jsonMatch[0]);

			if (Array.isArray(parsed)) {
				instructions = parsed.filter(
					(i): i is Instruction =>
						i != null && typeof i === "object" && "action" in i,
				);
			} else if (parsed && typeof parsed === "object") {
				if (Array.isArray(parsed.instructions)) {
					const rawInstructions = parsed.instructions as unknown[];
					const filtered = rawInstructions.filter(
						(i): i is Instruction =>
							i != null && typeof i === "object" && "action" in i,
					);
					instructions = filtered;
				}
				if (typeof parsed.reply === "string") {
					reply = parsed.reply;
				}
			}

			if (instructions.length > 0) {
				const cleanedReply = content
					.replace(jsonMatch[0], "")
					.replace(/```json|```/g, "")
					.trim();
				if (cleanedReply && cleanedReply !== content) {
					reply = cleanedReply;
				}
			}
		}
	} catch {
		instructions = [];
	}

	if (instructions.length === 0 && content.trim()) {
		reply = content;
	} else if (!reply || reply === content) {
		reply = "Done!";
	}

	return { instructions, reply };
}
