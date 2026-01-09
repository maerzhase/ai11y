import { Mark, useAssist } from "@ui4ai/react";

export function TrackingMiniDemo() {
	const { events, track } = useAssist();
	const last = events.slice(-3).reverse();

	return (
		<div className="rounded-lg border border-border bg-muted/30 p-3">
			<div className="flex items-center justify-between gap-3">
				<div className="text-xs text-muted-foreground">Recent events</div>
				<Mark
					id="tracking_demo_button"
					label="Track Demo Event"
					intent="Tracks a demo event to show analytics instrumentation"
				>
					<button
						type="button"
						onClick={() => track("demo_event", { source: "feature-card" })}
						className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
					>
						Track
					</button>
				</Mark>
			</div>

			<div className="mt-2 space-y-1">
				{last.length === 0 ? (
					<div className="text-xs text-muted-foreground">
						No events yet — click “Track” or ask the assistant to do something.
					</div>
				) : (
					last.map((e, idx) => (
						<div
							key={`${e.timestamp}-${e.type}-${idx}`}
							className="text-xs font-mono text-foreground"
						>
							{e.type}
						</div>
					))
				)}
			</div>
		</div>
	);
}
