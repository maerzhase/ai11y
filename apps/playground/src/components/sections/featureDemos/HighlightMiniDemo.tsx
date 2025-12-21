import React from "react";
import { Mark } from "@quest/react";

export function HighlightMiniDemo() {
	return (
		<div className="rounded-lg border border-border bg-muted/30 p-3">
			<div className="text-xs text-muted-foreground mb-2">Highlight target</div>
			<Mark
				id="highlight_demo_target"
				label="Demo Target"
				intent="A small badge to demonstrate highlighting"
			>
				<div className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
					Highlight me
				</div>
			</Mark>
		</div>
	);
}


