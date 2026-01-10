import { Mark } from "@ui4ai/react";
import { SuggestionChip } from "../SuggestionChip";

export function HighlightDemoWithSuggestions({
	onSuggestion,
}: {
	onSuggestion: (s: string) => void;
}) {
	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground mb-3">
				Elements can be highlighted on command:
			</div>
			<div className="grid grid-cols-2 gap-3">
				<Mark
					id="highlight_demo_badge_1"
					label="Feature Badge"
					intent="A badge demonstrating the highlight feature"
				>
					<div className="flex items-center justify-center px-4 py-6 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
						<span className="text-2xl">✨</span>
					</div>
				</Mark>
				<Mark
					id="highlight_demo_badge_2"
					label="Status Badge"
					intent="A status badge to highlight"
				>
					<div className="flex items-center justify-center px-4 py-6 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
						<span className="text-2xl">🎯</span>
					</div>
				</Mark>
				<Mark
					id="highlight_demo_badge_3"
					label="Action Badge"
					intent="An action badge to highlight"
				>
					<div className="flex items-center justify-center px-4 py-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
						<span className="text-2xl">⚡</span>
					</div>
				</Mark>
				<Mark
					id="highlight_demo_badge_4"
					label="Info Badge"
					intent="An info badge to highlight"
				>
					<div className="flex items-center justify-center px-4 py-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
						<span className="text-2xl">💡</span>
					</div>
				</Mark>
			</div>
			<p className="text-xs text-muted-foreground pt-2">
				Try{" "}
				<SuggestionChip onClick={() => onSuggestion("highlight feature badge")}>
					highlight feature badge
				</SuggestionChip>{" "}
				or{" "}
				<SuggestionChip onClick={() => onSuggestion("highlight status badge")}>
					highlight status badge
				</SuggestionChip>
			</p>
		</div>
	);
}
