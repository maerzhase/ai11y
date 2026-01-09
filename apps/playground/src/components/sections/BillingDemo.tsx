import { Mark } from "@ui4ai/react";
import { useState } from "react";

export function BillingDemo() {
	const [billingEnabled, setBillingEnabled] = useState(false);

	return (
		<Mark
			id="demo_billing_card"
			label="Billing Demo Card"
			intent="Billing settings demo card"
		>
			<div className="rounded-xl border border-border bg-card p-8 shadow-sm">
				<h3 className="text-2xl font-semibold mb-4 text-card-foreground">
					💳 Billing Demo
				</h3>
				<p className="text-muted-foreground mb-6">
					Try:{" "}
					<code className="px-2 py-1 bg-muted rounded text-sm">
						"click enable billing"
					</code>{" "}
					or{" "}
					<code className="px-2 py-1 bg-muted rounded text-sm">
						"highlight the enable button"
					</code>
				</p>
				<div className="space-y-4">
					<div>
						<p className="text-sm text-muted-foreground mb-2">
							Status:{" "}
							<span className="font-semibold text-foreground">
								{billingEnabled ? "✅ Enabled" : "❌ Disabled"}
							</span>
						</p>
					</div>
					<Mark
						id="demo_enable_billing"
						label="Enable Billing"
						intent="Enable billing for the demo"
					>
						<button
							type="button"
							onClick={() => setBillingEnabled(true)}
							disabled={billingEnabled}
							className={`w-full inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
								billingEnabled
									? "bg-muted text-muted-foreground cursor-not-allowed"
									: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md"
							}`}
						>
							{billingEnabled ? "✓ Billing Enabled" : "Enable Billing"}
						</button>
					</Mark>
				</div>
			</div>
		</Mark>
	);
}
