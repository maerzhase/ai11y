import { Mark } from "@ui4ai/react";
import { Card, Text } from "@ui4ai/ui";
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
					<Text render="h2" size="4xl" weight="bold" className="mb-4 tracking-tight">
						Billing Settings
					</Text>
				</Mark>
				<Text size="lg" color="secondary" className="mb-8">
					Manage your billing settings here. Try asking the assistant to
					"highlight the enable billing button" or "click enable billing".
				</Text>

				<Card padding="lg">
					<Text render="h3" size="2xl" weight="semibold" className="mb-4">
						Billing Status
					</Text>
					<Text size="sm" color="secondary" className="mb-6">
						Billing is currently:{" "}
						<Text weight="semibold" color="primary" render="span">
							{billingEnabled ? "Enabled" : "Disabled"}
						</Text>
					</Text>

					<Mark
						id="enable_billing"
						label="Enable Billing"
						intent="Enable billing for your account"
					>
						<button
							type="button"
							onClick={() => setBillingEnabled(true)}
							disabled={billingEnabled}
							className={`inline-flex items-center justify-center rounded-sm px-8 py-4 text-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
								billingEnabled
									? "bg-muted text-muted-foreground cursor-not-allowed"
									: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md hover:scale-105 cursor-pointer"
							}`}
						>
							{billingEnabled ? "✓ Billing Enabled" : "Enable Billing"}
						</button>
					</Mark>
				</Card>
			</div>
		</div>
	);
}
