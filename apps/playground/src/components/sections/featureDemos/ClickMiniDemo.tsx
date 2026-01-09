import { Mark } from "@ui4ai/react";
import { useState } from "react";

export function ClickMiniDemo() {
	const [isOn, setIsOn] = useState(false);

	return (
		<div className="rounded-sm border border-border bg-muted/30 p-3">
			<div className="flex items-center justify-between gap-3">
				<div className="text-xs text-muted-foreground">
					State:{" "}
					<span className="font-mono text-foreground">
						{isOn ? "ON" : "OFF"}
					</span>
				</div>
				<Mark
					id="click_demo_toggle"
					label="Demo Toggle"
					intent="Toggles local state to demonstrate click tool"
					showAssistBubble
				>
					<button
						type="button"
						onClick={() => setIsOn((v) => !v)}
						className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
					>
						Toggle
					</button>
				</Mark>
			</div>
		</div>
	);
}
