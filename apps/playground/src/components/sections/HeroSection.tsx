import { Mark } from "@ui4ai/react";

export function HeroSection() {
	return (
		<section className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
			<div className="relative max-w-5xl mx-auto text-center px-6 py-20">
				<Mark
					id="hero_title"
					label="ui4ai"
					intent="The main hero title - A semantic UI context layer for AI agents"
				>
					<h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent tracking-tight">
						ui4ai
					</h1>
				</Mark>
				<p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
					A semantic UI context layer for AI agents. Let users navigate,
					interact, and explore with natural language.
				</p>
				<p className="text-lg text-muted-foreground/80 mb-10 max-w-xl mx-auto">
					💬 Try saying:{" "}
					<span className="font-mono text-primary">
						"highlight the hero title"
					</span>{" "}
					or{" "}
					<span className="font-mono text-primary">"scroll to features"</span>
				</p>
				<div className="flex gap-4 justify-center flex-wrap">
					<Mark
						id="hero_try_demo"
						label="Try Demo"
						intent="Scroll to interactive demo section"
					>
						<button
							type="button"
							onClick={() => {
								document
									.getElementById("interactive-demo")
									?.scrollIntoView({ behavior: "smooth" });
							}}
							className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							✨ Try Interactive Demo
						</button>
					</Mark>
					<Mark
						id="hero_quick_start"
						label="Quick Start"
						intent="Scroll to quick start guide"
					>
						<button
							type="button"
							onClick={() => {
								document
									.getElementById("quick-start")
									?.scrollIntoView({ behavior: "smooth" });
							}}
							className="inline-flex items-center justify-center rounded-sm border-2 border-border bg-background px-8 py-4 text-lg font-semibold text-foreground transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							🚀 Quick Start
						</button>
					</Mark>
				</div>
			</div>
		</section>
	);
}
