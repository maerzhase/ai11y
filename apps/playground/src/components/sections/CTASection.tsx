import { Mark } from "@quest/react";

export function CTASection() {
	return (
		<section className="py-24 px-6 bg-gradient-to-br from-primary/10 via-background to-primary/10">
			<div className="max-w-4xl mx-auto text-center">
				<Mark
					id="cta_title"
					label="CTA Title"
					intent="Call to action section title"
				>
					<h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
						Ready to Build?
					</h2>
				</Mark>
				<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
					Add AI assistance to your React app in minutes. No complex setup, no
					vendor lock-in.
				</p>
				<div className="flex gap-4 justify-center flex-wrap">
					<Mark
						id="cta_install"
						label="Install Button"
						intent="Button to install React Quest"
					>
						<button
							type="button"
							onClick={() => {
								navigator.clipboard.writeText("pnpm add @quest/react");
								alert("Install command copied! Run: pnpm add @quest/react");
							}}
							className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							📦 Install Now
						</button>
					</Mark>
					<Mark
						id="cta_docs"
						label="Documentation Button"
						intent="Button to view documentation"
					>
						<button
							type="button"
							onClick={() => {
								document
									.getElementById("quick-start")
									?.scrollIntoView({ behavior: "smooth" });
							}}
							className="inline-flex items-center justify-center rounded-lg border-2 border-border bg-background px-8 py-4 text-lg font-semibold text-foreground transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							📚 View Docs
						</button>
					</Mark>
				</div>
			</div>
		</section>
	);
}

