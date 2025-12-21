import { Mark, useAssist } from "@quest/react";
import React, { useState } from "react";

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
			<div className="rounded-xl border border-border bg-card p-8 shadow-sm">
				<h3 className="text-2xl font-semibold mb-4 text-card-foreground">
					🔌 Integrations Demo
				</h3>
				<p className="text-muted-foreground mb-6">
					Try:{" "}
					<code className="px-2 py-1 bg-muted rounded text-sm">
						"connect stripe"
					</code>{" "}
					- watch error handling in action!
				</p>
				<div className="space-y-4">
					{stripeConnected ? (
						<div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm font-medium text-emerald-800 dark:text-emerald-300">
							✓ Connected Successfully
						</div>
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
									className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								>
									{stripeFailed ? "Retry Connection" : "Connect Stripe"}
								</button>
							</Mark>
							{stripeFailed && (
								<p className="text-destructive text-sm">
									Connection failed. Ask the assistant to retry!
								</p>
							)}
						</>
					)}
				</div>
			</div>
		</Mark>
	);
}

