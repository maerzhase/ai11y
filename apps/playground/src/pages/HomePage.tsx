import { Mark } from "@quest/react";
import { useState } from "react";
import { FeatureSlide } from "../components/FeatureSlide";
import { ScrollyHero } from "../components/ScrollyHero";
import { SuggestionChip } from "../components/SuggestionChip";
import { Footer } from "../components/sections/Footer";
import { useDemoRoute } from "../context/DemoRouteContext";

// Enhanced Navigation Demo
function NavigationDemo() {
	const { demoRoute } = useDemoRoute();

	const routes = [
		{ path: "/", label: "Home", icon: "🏠" },
		{ path: "/billing", label: "Billing", icon: "💳" },
		{ path: "/integrations", label: "Integrations", icon: "🔌" },
	];

	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground mb-3">
				The assistant understands your routes:
			</div>
			<div className="space-y-2">
				{routes.map((route) => (
					<Mark
						key={route.path}
						id={`nav_route_${route.path.replace("/", "") || "home"}`}
						label={`${route.label} Route`}
						intent={`Navigate to ${route.label} page`}
					>
						<div
							className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
								demoRoute === route.path
									? "border-primary bg-primary/10 text-foreground"
									: "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
							}`}
						>
							<span className="text-lg">{route.icon}</span>
							<span className="font-medium">{route.label}</span>
							{demoRoute === route.path && (
								<span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
									current
								</span>
							)}
						</div>
					</Mark>
				))}
			</div>
		</div>
	);
}

// Navigation Demo with suggestions
function NavigationDemoWithSuggestions({
	onSuggestion,
}: { onSuggestion: (s: string) => void }) {
	return (
		<div className="space-y-4">
			<NavigationDemo />
			<p className="text-xs text-muted-foreground pt-2">
				Try{" "}
				<SuggestionChip onClick={() => onSuggestion("go to billing")}>
					go to billing
				</SuggestionChip>
				{" "}or{" "}
				<SuggestionChip onClick={() => onSuggestion("navigate to integrations")}>
					navigate to integrations
				</SuggestionChip>
			</p>
		</div>
	);
}

// Enhanced Highlight Demo
function HighlightDemoWithSuggestions({
	onSuggestion,
}: { onSuggestion: (s: string) => void }) {
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
					showAssistBubble
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
				</SuggestionChip>
				{" "}or{" "}
				<SuggestionChip onClick={() => onSuggestion("highlight status badge")}>
					highlight status badge
				</SuggestionChip>
			</p>
		</div>
	);
}

// Enhanced Click Demo
function ClickDemoWithSuggestions({
	onSuggestion,
}: { onSuggestion: (s: string) => void }) {
	const [counter, setCounter] = useState(0);
	const [isActive, setIsActive] = useState(false);

	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground mb-3">
				The assistant can interact with buttons:
			</div>
			<div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
				<div>
					<div className="text-xs text-muted-foreground mb-1">Counter</div>
					<div className="text-2xl font-bold text-foreground">{counter}</div>
				</div>
				<div className="flex gap-2">
					<Mark
						id="click_demo_decrement"
						label="Decrement Button"
						intent="Decreases the counter by 1"
						showAssistBubble
					>
						<button
							type="button"
							onClick={() => setCounter((c) => c - 1)}
							className="w-10 h-10 rounded-lg border border-border bg-background text-foreground font-bold hover:bg-muted transition-colors"
						>
							−
						</button>
					</Mark>
					<Mark
						id="click_demo_increment"
						label="Increment Button"
						intent="Increases the counter by 1"
						showAssistBubble
					>
						<button
							type="button"
							onClick={() => setCounter((c) => c + 1)}
							className="w-10 h-10 rounded-lg border border-border bg-background text-foreground font-bold hover:bg-muted transition-colors"
						>
							+
						</button>
					</Mark>
				</div>
			</div>
			<div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
				<div>
					<div className="text-xs text-muted-foreground mb-1">Status</div>
					<div
						className={`text-sm font-medium ${isActive ? "text-emerald-500" : "text-muted-foreground"}`}
					>
						{isActive ? "Active" : "Inactive"}
					</div>
				</div>
				<Mark
					id="click_demo_toggle"
					label="Toggle Status"
					intent="Toggles the active status"
				>
					<button
						type="button"
						onClick={() => setIsActive((v) => !v)}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${
							isActive
								? "bg-emerald-500 text-white hover:bg-emerald-600"
								: "border border-border bg-background text-foreground hover:bg-muted"
						}`}
					>
						{isActive ? "Deactivate" : "Activate"}
					</button>
				</Mark>
			</div>
			<p className="text-xs text-muted-foreground pt-2">
				Try{" "}
				<SuggestionChip onClick={() => onSuggestion("click increment")}>
					click increment
				</SuggestionChip>
				,{" "}
				<SuggestionChip onClick={() => onSuggestion("click decrement")}>
					click decrement
				</SuggestionChip>
				{" "}or{" "}
				<SuggestionChip onClick={() => onSuggestion("toggle status")}>
					toggle status
				</SuggestionChip>
			</p>
		</div>
	);
}

export function HomePage() {
	// Pass suggestions to the floating input
	const handleSuggestion = (suggestion: string) => {
		const input = document.querySelector<HTMLInputElement>(
			'input[placeholder="Ask anything..."]'
		);
		if (input) {
			const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				"value"
			)?.set;
			nativeInputValueSetter?.call(input, suggestion);
			input.dispatchEvent(new Event("input", { bubbles: true }));
			input.focus();
		}
	};

	return (
		<div className="scrolly-container">
			{/* Background pattern */}
			<div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
			<div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/3 via-transparent to-primary/3" />

			{/* Hero Section */}
			<ScrollyHero />

			{/* Feature Slides */}
			<Mark
				id="features_section"
				label="Features Section"
				intent="The main features showcase area"
			>
				<div>
					<FeatureSlide
						id="feature-navigation"
						direction="left"
						emoji="🧭"
						title="Smart Navigation"
						description="Navigate between pages using natural language. The assistant understands your app's routing structure and can take users anywhere they ask."
					>
						<NavigationDemoWithSuggestions onSuggestion={handleSuggestion} />
					</FeatureSlide>

					<FeatureSlide
						id="feature-highlight"
						direction="right"
						emoji="✨"
						title="Visual Highlighting"
						description="Draw attention to any element with customizable highlight animations. Perfect for tutorials, onboarding flows, and guided experiences."
					>
						<HighlightDemoWithSuggestions onSuggestion={handleSuggestion} />
					</FeatureSlide>

					<FeatureSlide
						id="feature-click"
						direction="left"
						emoji="👆"
						title="Smart Clicking"
						description="Let the assistant interact with buttons, links, and any clickable element. Users can describe what they want to do in plain English."
					>
						<ClickDemoWithSuggestions onSuggestion={handleSuggestion} />
					</FeatureSlide>
				</div>
			</Mark>

			{/* Footer */}
			<Footer />
		</div>
	);
}
