import { BillingDemo } from "./BillingDemo";
import { IntegrationsDemo } from "./IntegrationsDemo";

export function InteractiveDemoSection() {
	return (
		<section id="interactive-demo" className="py-24 px-6 bg-background">
			<div className="max-w-6xl mx-auto">
				<h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground tracking-tight">
					Try It Live
				</h2>
				<p className="text-center text-muted-foreground mb-12 text-lg max-w-2xl mx-auto">
					Interact with the assistant panel in the bottom right. Try the demos
					below!
				</p>

				<div className="grid md:grid-cols-2 gap-8 mb-12">
					<BillingDemo />
					<IntegrationsDemo />
				</div>
			</div>
		</section>
	);
}

