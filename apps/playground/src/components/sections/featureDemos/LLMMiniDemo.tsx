import { Mark, useAssist } from "@ui4ai/react";

export function LLMMiniDemo() {
	const { agentConfig } = useAssist();
	const isLLMEnabled = agentConfig?.apiEndpoint !== undefined;

	return (
		<div className="rounded-sm border border-border bg-muted/30 p-3">
			<div className="text-xs text-muted-foreground mb-2">Mode</div>
			<Mark
				id="llm_demo_status"
				label="LLM Mode Status"
				intent="Shows whether the agent is using an LLM agent or rule-based fallback"
			>
				<div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground">
					<span
						className={`inline-block h-2 w-2 rounded-full ${
							isLLMEnabled ? "bg-emerald-500" : "bg-amber-500"
						}`}
					/>
					{isLLMEnabled ? "LLM enabled" : "Rule-based fallback"}
				</div>
			</Mark>
			<div className="mt-2 text-xs text-muted-foreground">
				If you configure the server endpoint, the same UI becomes context-aware.
			</div>
		</div>
	);
}
