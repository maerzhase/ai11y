import { FeatureSlide } from "../components/FeatureSlide";
import { ClickDemoWithSuggestions } from "../components/Homepage/ClickDemo";
import { HighlightDemoWithSuggestions } from "../components/Homepage/HighlightDemo";
import { InputFillDemoWithSuggestions } from "../components/Homepage/InputFillDemo";
import { NavigationDemoWithSuggestions } from "../components/Homepage/NavigationDemo";
import { ScrollyHero } from "../components/ScrollyHero";
import { Footer } from "../components/sections/Footer";

export function HomePage() {
	// Pass suggestions to the floating input
	const handleSuggestion = (suggestion: string) => {
		const input = document.querySelector<HTMLInputElement>(
			'input[placeholder="Ask anything..."]',
		);
		if (input) {
			const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				"value",
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
			<div>
				<FeatureSlide
					id="feature-navigation"
					direction="left"
					emoji="🧭"
					title="Navigation"
					description="Navigate between pages using natural language. The agent understands your app's routing structure and can take users anywhere they ask."
					markerId="slide_navigation"
					markerLabel="Navigation Section"
					markerIntent="Navigate to the Navigation feature section"
				>
					<NavigationDemoWithSuggestions onSuggestion={handleSuggestion} />
				</FeatureSlide>

				<FeatureSlide
					id="feature-highlight"
					direction="right"
					emoji="✨"
					title="Visual Highlighting"
					description="Draw attention to any element with customizable highlight animations. Perfect for tutorials, onboarding flows, and guided experiences."
					markerId="slide_highlight"
					markerLabel="Visual Highlighting Section"
					markerIntent="Navigate to the Visual Highlighting feature section"
				>
					<HighlightDemoWithSuggestions onSuggestion={handleSuggestion} />
				</FeatureSlide>

				<FeatureSlide
					id="feature-click"
					direction="left"
					emoji="👆"
					title="Clicking"
					description="Let the agent interact with buttons, links, and any clickable element. Users can describe what they want to do in natural language."
					markerId="slide_click"
					markerLabel="Clicking Section"
					markerIntent="Navigate to the Clicking feature section"
				>
					<ClickDemoWithSuggestions onSuggestion={handleSuggestion} />
				</FeatureSlide>

				<FeatureSlide
					id="feature-fill-input"
					direction="right"
					emoji="⌨️"
					title="Input Filling"
					description="The agent can fill form inputs with values using natural language. Works with text inputs, textareas, and emits native browser events for React compatibility."
					markerId="slide_fill_input"
					markerLabel="Input Filling Section"
					markerIntent="Navigate to the Input Filling feature section"
				>
					<InputFillDemoWithSuggestions onSuggestion={handleSuggestion} />
				</FeatureSlide>
			</div>

			{/* Footer */}
			<Footer />
		</div>
	);
}
