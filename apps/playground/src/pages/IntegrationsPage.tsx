import { Mark, useAssist } from "@quest/react";
import { useState } from "react";

export function IntegrationsPage() {
	const { reportError } = useAssist();
	const [hasFailed, setHasFailed] = useState(false);
	const [isConnected, setIsConnected] = useState(false);

	const handleConnectStripe = () => {
		if (!hasFailed) {
			// Simulate failure on first click
			setHasFailed(true);
			const error = new Error(
				"Failed to connect to Stripe API. Please check your credentials.",
			);
			reportError(error, {
				surface: "integrations",
				markerId: "connect_stripe",
			});
		} else {
			// Retry - succeed this time
			setIsConnected(true);
			setHasFailed(false);
		}
	};

	return (
		<div className="min-h-[calc(100vh-3.5rem)] py-12 px-6 bg-background">
			<div className="max-w-4xl mx-auto">
				<Mark
					id="integrations_page_title"
					label="Integrations Page Title"
					intent="The integrations page title"
				>
					<h2 className="text-4xl font-bold mb-4 text-foreground tracking-tight">
						Integrations
					</h2>
				</Mark>
				<p className="text-muted-foreground mb-8 text-lg">
					Connect third-party services to enhance your app. Try asking the
					assistant to "click connect stripe" or "highlight the stripe card".
				</p>

				<div className="rounded-xl border border-border bg-card p-8 shadow-sm mb-6">
					<div className="flex items-center gap-4 mb-6">
						<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
								/>
							</svg>
						</div>
						<div>
							<Mark
								id="stripe_card_title"
								label="Stripe Integration Card"
								intent="The Stripe integration card title"
							>
								<h3 className="text-2xl font-semibold text-card-foreground">
									Stripe
								</h3>
							</Mark>
							<p className="text-muted-foreground text-sm">
								Connect Stripe to accept payments
							</p>
						</div>
					</div>
					{isConnected ? (
						<div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-6 py-4 text-base font-medium text-emerald-800 dark:text-emerald-300">
							✓ Connected Successfully
						</div>
					) : (
						<Mark
							id="connect_stripe"
							label="Connect Stripe"
							intent="Connect Stripe to accept payments"
						>
							<button
								type="button"
								onClick={handleConnectStripe}
								className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								{hasFailed ? "Retry Connection" : "Connect Stripe"}
							</button>
						</Mark>
					)}
					{hasFailed && !isConnected && (
						<p className="text-destructive mt-4 text-sm">
							Connection failed. Ask the assistant to retry!
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
