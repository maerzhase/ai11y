import { useState } from "react";
import { FeatureSlide } from "../components/FeatureSlide";
import { ClickDemoWithSuggestions } from "../components/Homepage/ClickDemo";
import { demoCodeExamples } from "../components/Homepage/demoCodeExamples";
import { HighlightDemoWithSuggestions } from "../components/Homepage/HighlightDemo";
import { InputFillDemoWithSuggestions } from "../components/Homepage/InputFillDemo";
import { NavigationDemo } from "../components/Homepage/NavigationDemo";
import { ScrollyHero } from "../components/ScrollyHero";
import { Footer } from "../components/sections/Footer";
import {
	SuggestionInputProvider,
	useSuggestionInput,
} from "../context/SuggestionInputContext";

function FeatureSlides() {
	const { setSuggestion } = useSuggestionInput();

	return (
		<div>
			<FeatureSlide
				id="feature-navigation"
				direction="left"
				emoji="🧭"
				title="Navigation"
				description="Navigate between pages using natural language. The agent understands your app's routing structure and can take users anywhere they ask."
				code={demoCodeExamples.navigation}
				markerId="slide_navigation"
				markerLabel="Navigation Section"
				markerIntent="Navigate to the Navigation feature section"
			>
				<NavigationDemo onSuggestion={setSuggestion} />
			</FeatureSlide>

			<FeatureSlide
				id="feature-highlight"
				direction="right"
				emoji="✨"
				title="Visual Highlighting"
				description="Draw attention to any element with customizable highlight animations. Perfect for tutorials, onboarding flows, and guided experiences."
				code={demoCodeExamples.highlight}
				markerId="slide_highlight"
				markerLabel="Visual Highlighting Section"
				markerIntent="Navigate to the Visual Highlighting feature section"
			>
				<HighlightDemoWithSuggestions onSuggestion={setSuggestion} />
			</FeatureSlide>

			<FeatureSlide
				id="feature-click"
				direction="left"
				emoji="👆"
				title="Interaction"
				description="The agent can interact with UI elements like buttons, links, and other clickable components. Users can describe their intent in natural language, and the agent will take the appropriate action."
				code={demoCodeExamples.click}
				markerId="slide_click"
				markerLabel="Interaction Section"
				markerIntent="Navigate to the Interaction feature section"
			>
				<ClickDemoWithSuggestions onSuggestion={setSuggestion} />
			</FeatureSlide>

			<FeatureSlide
				id="feature-fill-input"
				direction="right"
				emoji="⌨️"
				title="Form Awareness"
				description="The agent is aware of the current state of form fields and can fill inputs with values using natural language. Ask about current values or fill text inputs, textareas, and dropdowns. Emits native browser events for compatibility."
				code={demoCodeExamples.inputFill}
				markerId="slide_fill_input"
				markerLabel="Form Awareness Section"
				markerIntent="Navigate to the Form Awareness feature section"
			>
				<InputFillDemoWithSuggestions onSuggestion={setSuggestion} />
			</FeatureSlide>
		</div>
	);
}

export function HomePage() {
	const [suggestionHandler, setSuggestionHandler] = useState<
		((suggestion: string) => void) | null
	>(null);

	const handleSuggestionReady = (handler: (suggestion: string) => void) => {
		setSuggestionHandler(() => handler);
	};

	// Provide default no-op handler until ScrollyHero is ready
	const currentHandler = suggestionHandler || (() => {});

	return (
		<SuggestionInputProvider value={{ setSuggestion: currentHandler }}>
			<div className="scrolly-container">
				{/* Background pattern */}
				<div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
				<div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/3 via-transparent to-primary/3" />

				{/* Hero Section */}
				<ScrollyHero onSuggestionReady={handleSuggestionReady} />

				{/* Feature Slides */}
				<FeatureSlides />

				{/* Footer */}
				<Footer />
			</div>
		</SuggestionInputProvider>
	);
}
