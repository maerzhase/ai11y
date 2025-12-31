import { Mark, useAssist } from "@quest/react";
import type { ReactNode } from "react";

interface FeatureCardProps {
	id: string;
	emoji: string;
	title: string;
	description: string;
	tryMessage: string;
	tryLabel?: string;
	demo?: ReactNode;
}

export function FeatureCard({
	id,
	emoji,
	title,
	description,
	tryMessage,
	tryLabel = "Try it →",
	demo,
}: FeatureCardProps) {
	const { openPanelWithMessage } = useAssist();

	const handleTry = () => openPanelWithMessage(tryMessage);

	return (
		<Mark
			id={`feature_${id}`}
			label={`${title} Feature`}
			intent={`Feature card about ${title.toLowerCase()}`}
		>
			<div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
				<div className="relative">
					<div className="w-12 h-12 rounded-lg bg-primary/10 mb-4 flex items-center justify-center text-primary text-2xl">
						{emoji}
					</div>
					<h3 className="text-xl font-semibold mb-2 text-card-foreground">
						{title}
					</h3>
					<p className="text-muted-foreground text-sm mb-4 leading-relaxed">
						{description}
					</p>
					<div className="flex items-center justify-between gap-3">
						<button
							type="button"
							onClick={handleTry}
							className="text-sm text-primary hover:underline font-medium"
						>
							{tryLabel}
						</button>
						<code className="text-xs text-muted-foreground bg-muted/60 border border-border rounded px-2 py-1">
							{tryMessage}
						</code>
					</div>

					{demo && <div className="mt-4">{demo}</div>}
				</div>
			</div>
		</Mark>
	);
}
