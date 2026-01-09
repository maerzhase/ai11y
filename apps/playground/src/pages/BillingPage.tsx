import { Mark } from "@ui4ai/react";
import { useState } from "react";

export function BillingPage() {
	const [billingEnabled, setBillingEnabled] = useState(false);

	return (
		<div className="min-h-[calc(100vh-3.5rem)] py-12 px-6 bg-background">
			<div className="max-w-4xl mx-auto">
				<Mark
					id="billing_page_title"
					label="Billing Page Title"
					intent="The billing page title"
				>
					<h2 className="text-4xl font-bold mb-4 text-foreground tracking-tight">
						Billing Settings
					</h2>
				</Mark>
				<p className="text-muted-foreground mb-8 text-lg">
					Manage your billing settings here. Try asking the assistant to
					"highlight the enable billing button" or "click enable billing".
				</p>

				<div className="rounded-xl border border-border bg-card p-8 shadow-sm">
					<h3 className="text-2xl font-semibold mb-4 text-card-foreground">
						Billing Status
					</h3>
					<p className="text-muted-foreground mb-6">
						Billing is currently:{" "}
						<span className="font-semibold text-foreground">
							{billingEnabled ? "Enabled" : "Disabled"}
						</span>
					</p>

					<Mark
						id="enable_billing"
						label="Enable Billing"
						intent="Enable billing for your account"
					>
						<button
							type="button"
							onClick={() => setBillingEnabled(true)}
							disabled={billingEnabled}
							className={`inline-flex items-center justify-center rounded-lg px-8 py-4 text-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
								billingEnabled
									? "bg-muted text-muted-foreground cursor-not-allowed"
									: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md hover:scale-105 cursor-pointer"
							}`}
						>
							{billingEnabled ? "✓ Billing Enabled" : "Enable Billing"}
						</button>
					</Mark>
				</div>
			</div>
		</div>
	);
}
