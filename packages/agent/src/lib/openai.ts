import type { Instruction, PlanResponse } from "../types.js";

export interface OpenAIParams {
	apiKey: string;
	model: string;
	baseURL?: string;
	temperature: number;
	message: string;
	contextMessage: string;
	history: Array<{ role: "user" | "assistant"; content: string }>;
	systemPrompt: string;
}

export async function planWithOpenAI(
	params: OpenAIParams,
): Promise<PlanResponse> {
	const {
		apiKey,
		model,
		baseURL,
		temperature,
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
	});

	const assistantMessage = response.choices[0]?.message;
	if (!assistantMessage) {
		throw new Error("No response from OpenAI");
	}

	const content = assistantMessage.content || "";
	return parseResponse(content);
}

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
