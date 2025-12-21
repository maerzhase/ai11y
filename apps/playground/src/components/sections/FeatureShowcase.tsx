import React from "react";
import { Mark } from "@quest/react";
import { FeatureCard } from "./FeatureCard";
import { ClickMiniDemo } from "./featureDemos/ClickMiniDemo";
import { ErrorMiniDemo } from "./featureDemos/ErrorMiniDemo";
import { HighlightMiniDemo } from "./featureDemos/HighlightMiniDemo";
import { LLMMiniDemo } from "./featureDemos/LLMMiniDemo";
import { NavigationMiniDemo } from "./featureDemos/NavigationMiniDemo";
import { TrackingMiniDemo } from "./featureDemos/TrackingMiniDemo";

export function FeatureShowcase() {
	const features = [
		{
			id: "navigation",
			emoji: "🧭",
			title: "Smart Navigation",
			description:
				"Navigate between pages using natural language. Works with any routing library.",
			tryMessage: "go to billing",
			demo: <NavigationMiniDemo />,
		},
		{
			id: "highlight",
			emoji: "✨",
			title: "Visual Highlighting",
			description:
				"Customizable highlight animations. Perfect for tutorials and guided experiences.",
			tryMessage: "highlight demo target",
			demo: <HighlightMiniDemo />,
		},
		{
			id: "click",
			emoji: "👆",
			title: "Smart Clicking",
			description:
				"Trigger clicks on any marked element. Works with buttons, links, and custom components.",
			tryMessage: "click demo toggle",
			demo: <ClickMiniDemo />,
		},
		{
			id: "error",
			emoji: "🛡️",
			title: "Error Recovery",
			description:
				"Automatic error detection and recovery suggestions. The assistant helps users fix issues.",
			tryMessage: "click connect stripe mini demo",
			demo: <ErrorMiniDemo />,
		},
		{
			id: "tracking",
			emoji: "📊",
			title: "Event Tracking",
			description:
				"Track user interactions and assistant actions. Perfect for analytics and debugging.",
			tryMessage: "click track demo event",
			demo: <TrackingMiniDemo />,
		},
		{
			id: "llm",
			emoji: "🤖",
			title: "LLM-Powered",
			description:
				"Optional server-side LLM agent for intelligent, context-aware interactions. Falls back to rule-based.",
			tryMessage: "what can you help me with?",
			demo: <LLMMiniDemo />,
			tryLabel: "Try it →",
		},
	];

	return (
		<section id="features-section" className="py-24 px-6 bg-muted/20">
			<div className="max-w-6xl mx-auto">
				<Mark
					id="features_title"
					label="Features Title"
					intent="The features section title"
				>
					<h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground tracking-tight">
						Powerful Features
					</h2>
				</Mark>
				<p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
					Everything you need to build intelligent, interactive experiences
				</p>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature) => (
						<FeatureCard key={feature.id} {...feature} />
					))}
				</div>
			</div>
		</section>
	);
}

