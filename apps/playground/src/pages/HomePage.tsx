import React from "react";
import { CTASection } from "../components/sections/CTASection";
import { CodeExamplesSection } from "../components/sections/CodeExamplesSection";
import { FeatureShowcase } from "../components/sections/FeatureShowcase";
import { Footer } from "../components/sections/Footer";
import { HeroSection } from "../components/sections/HeroSection";
import { InteractiveDemoSection } from "../components/sections/InteractiveDemoSection";
import { QuickStartGuide } from "../components/sections/QuickStartGuide";

export function HomePage() {
	return (
		<div className="w-full">
			<HeroSection />
			<QuickStartGuide />
			<InteractiveDemoSection />
			<FeatureShowcase />
			<CodeExamplesSection />
			<CTASection />
			<Footer />
		</div>
	);
}
