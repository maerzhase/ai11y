import { Mark, useAssist } from "@quest/react";
import { FeatureCard } from "./FeatureCard";

export function FeatureShowcase() {
	const { highlight, click, track, reportError } = useAssist();

	const features = [
		{
			id: "navigation",
			emoji: "🧭",
			title: "Smart Navigation",
			description:
				"Navigate between pages using natural language. Works with any routing library.",
			onTry: () => {
				alert('Try saying: "go to billing" or "navigate to integrations"');
			},
		},
		{
			id: "highlight",
			emoji: "✨",
			title: "Visual Highlighting",
			description:
				"Customizable highlight animations. Perfect for tutorials and guided experiences.",
			onTry: () => {
				highlight("feature_highlight");
			},
		},
		{
			id: "click",
			emoji: "👆",
			title: "Smart Clicking",
			description:
				"Trigger clicks on any marked element. Works with buttons, links, and custom components.",
			onTry: () => {
				click("demo_enable_billing");
			},
		},
		{
			id: "error",
			emoji: "🛡️",
			title: "Error Recovery",
			description:
				"Automatic error detection and recovery suggestions. The assistant helps users fix issues.",
			onTry: () => {
				const error = new Error("Demo error - this is just a showcase!");
				reportError(error, { markerId: "feature_error" });
			},
		},
		{
			id: "tracking",
			emoji: "📊",
			title: "Event Tracking",
			description:
				"Track user interactions and assistant actions. Perfect for analytics and debugging.",
			onTry: () => {
				track("demo_event", { feature: "tracking", timestamp: Date.now() });
				alert("Event tracked! Check the console or your analytics.");
			},
		},
		{
			id: "llm",
			emoji: "🤖",
			title: "LLM-Powered",
			description:
				"Optional server-side LLM agent for intelligent, context-aware interactions. Falls back to rule-based.",
			onTry: () => {
				alert("Configure your server with OpenAI API key to enable LLM mode!");
			},
			tryLabel: "Learn more →",
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

