import { createAgent, type PlanRequest, type PlanResponse } from "@ai11y/agent";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body: PlanRequest = await request.json();
		const { message, context, history = [] } = body;

		const apiKey = process.env.OPENAI_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "OPENAI_API_KEY not configured" },
				{ status: 500 },
			);
		}

		const agent = createAgent({
			apiKey,
			model: "gpt-4o",
		});

		const result: PlanResponse = await agent.plan({
			message,
			context,
			history,
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error("Agent API error:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
