import { Mark, useAssist } from "@ui4ai/react";
import { Card, Text, Badge } from "@ui4ai/ui";
import { useState } from "react";

export function IntegrationsDemo() {
	const { reportError } = useAssist();
	const [stripeConnected, setStripeConnected] = useState(false);
	const [stripeFailed, setStripeFailed] = useState(false);

	const handleStripeConnect = () => {
		if (!stripeFailed) {
			setStripeFailed(true);
			const error = new Error(
				"Failed to connect to Stripe API. Please check your credentials.",
			);
			reportError(error, {
				surface: "integrations",
				markerId: "demo_connect_stripe",
			});
		} else {
			setStripeConnected(true);
			setStripeFailed(false);
		}
	};

	return (
		<Mark
			id="demo_integrations_card"
			label="Integrations Demo Card"
			intent="Integrations demo card with error handling"
		>
			<Card padding="lg">
				<Text render="h3" size="2xl" weight="semibold" className="mb-4">
					🔌 Integrations Demo
				</Text>
				<Text size="sm" color="secondary" className="mb-6">
					Try:{" "}
					<code className="px-2 py-1 bg-muted rounded-xs text-sm">
						"connect stripe"
					</code>{" "}
					- watch error handling in action!
				</Text>
				<div className="space-y-4">
					{stripeConnected ? (
						<Badge variant="success" className="px-4 py-3 text-sm">
							✓ Connected Successfully
						</Badge>
					) : (
						<>
							<Mark
								id="demo_connect_stripe"
								label="Connect Stripe"
								intent="Connect Stripe integration"
							>
								<button
									type="button"
									onClick={handleStripeConnect}
									className="w-full inline-flex items-center justify-center rounded-sm bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								>
									{stripeFailed ? "Retry Connection" : "Connect Stripe"}
								</button>
							</Mark>
							{stripeFailed && (
								<Text color="destructive" size="sm">
									Connection failed. Ask the assistant to retry!
								</Text>
							)}
						</>
					)}
				</div>
			</Card>
		</Mark>
	);
}
