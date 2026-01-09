import { Mark, useAssist } from "@ui4ai/react";

export function NavigationMiniDemo() {
	const { currentRoute } = useAssist();

	return (
		<div className="rounded-sm border border-border bg-muted/30 p-3">
			<div className="text-xs text-muted-foreground mb-2">
				Agent context
			</div>
			<Mark
				id="nav_demo_current_route"
				label="Current Route (Demo)"
				intent="Shows the current route the agent sees"
			>
				<div className="text-sm font-mono text-foreground">{currentRoute}</div>
			</Mark>
			<div className="mt-2 text-xs text-muted-foreground">
				Tip: hit Enter after the command is filled to actually navigate.
			</div>
		</div>
	);
}
