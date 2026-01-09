import { Mark, useAssist } from "@ui4ai/react";
import { useState } from "react";

export function ErrorMiniDemo() {
	const { reportError } = useAssist();
	const [hasFailed, setHasFailed] = useState(false);
	const [isConnected, setIsConnected] = useState(false);

	const handleConnect = () => {
		if (!hasFailed) {
			setHasFailed(true);
			const error = new Error(
				"Stripe connection failed (mini demo). Ask the assistant to retry.",
			);
			reportError(error, {
				surface: "feature-card",
				markerId: "error_demo_connect",
			});
			return;
		}

		setIsConnected(true);
		setHasFailed(false);
	};

	return (
		<div className="rounded-sm border border-border bg-muted/30 p-3">
			<div className="text-xs text-muted-foreground mb-2">Error + recovery</div>
			{isConnected ? (
				<div className="rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
					✓ Connected (mini demo)
				</div>
			) : (
				<div className="space-y-2">
					<Mark
						id="error_demo_connect"
						label="Connect Stripe Mini Demo"
						intent="Fails the first time, then succeeds on retry"
					>
						<button
							type="button"
							onClick={handleConnect}
							className="w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
						>
							{hasFailed ? "Retry Connection" : "Connect Stripe"}
						</button>
					</Mark>
					{hasFailed && (
						<p className="text-xs text-destructive">
							Failure simulated. Try: “retry”.
						</p>
					)}
				</div>
			)}
		</div>
	);
}
