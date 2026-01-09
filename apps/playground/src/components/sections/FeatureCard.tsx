import { Mark, useAssist } from "@ui4ai/react";
import { Card, Text } from "@ui4ai/ui";
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
			<Card
				className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
				padding="lg"
			>
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
				<div className="relative">
					<div className="w-12 h-12 rounded-sm bg-primary/10 mb-4 flex items-center justify-center text-primary text-2xl">
						{emoji}
					</div>
					<Text render="h3" size="lg" weight="semibold" className="mb-2">
						{title}
					</Text>
					<Text size="sm" color="secondary" className="mb-4 leading-relaxed">
						{description}
					</Text>
					<div className="flex items-center justify-between gap-3">
						<button
							type="button"
							onClick={handleTry}
							className="text-sm text-primary hover:underline font-medium"
						>
							{tryLabel}
						</button>
						<code className="text-xs text-muted-foreground bg-muted/60 border border-border rounded-xs px-2 py-1">
							{tryMessage}
						</code>
					</div>

					{demo && <div className="mt-4">{demo}</div>}
				</div>
			</Card>
		</Mark>
	);
}
