import { Mark } from "@ui4ai/react";
import { Card, Text } from "@ui4ai/ui";
import { useState } from "react";

export function BillingDemo() {
	const [billingEnabled, setBillingEnabled] = useState(false);

	return (
		<Mark
			id="demo_billing_card"
			label="Billing Demo Card"
			intent="Billing settings demo card"
		>
			<Card padding="lg">
				<Text render="h3" size="2xl" weight="semibold" className="mb-4">
					💳 Billing Demo
				</Text>
				<Text size="sm" color="secondary" className="mb-6">
					Try:{" "}
					<code className="px-2 py-1 bg-muted rounded-xs text-sm">
						"click enable billing"
					</code>{" "}
					or{" "}
					<code className="px-2 py-1 bg-muted rounded-xs text-sm">
						"highlight the enable button"
					</code>
				</Text>
				<div className="space-y-4">
					<div>
						<Text size="sm" color="secondary" className="mb-2">
							Status:{" "}
							<Text weight="semibold" color="primary" render="span">
								{billingEnabled ? "✅ Enabled" : "❌ Disabled"}
							</Text>
						</Text>
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
							className={`w-full inline-flex items-center justify-center rounded-sm px-6 py-3 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
								billingEnabled
									? "bg-muted text-muted-foreground cursor-not-allowed"
									: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md"
							}`}
						>
							{billingEnabled ? "✓ Billing Enabled" : "Enable Billing"}
						</button>
					</Mark>
				</div>
			</Card>
		</Mark>
	);
}
