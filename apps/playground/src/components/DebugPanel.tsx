import { useAssist } from "@ui4ai/react";
import { useEffect, useState } from "react";

export function DebugPanel() {
	const { events, getContext, currentRoute, assistState, lastError } = useAssist();
	const [isOpen, setIsOpen] = useState(() => {
		const stored = localStorage.getItem("debug-panel-open");
		return stored === "true";
	});
	const [context, setContext] = useState(() => getContext());

	// Update context periodically and when route/state changes
	useEffect(() => {
		const updateContext = () => {
			setContext(getContext());
		};

		// Update immediately
		updateContext();

		// Update periodically to catch marker changes
		const interval = setInterval(updateContext, 1000);

		return () => clearInterval(interval);
	}, [getContext, currentRoute, assistState]);

	// Persist open state
	useEffect(() => {
		localStorage.setItem("debug-panel-open", String(isOpen));
	}, [isOpen]);

	const formatTimestamp = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			millisecond: "2-digit",
		});
	};

	const formatPayload = (payload: unknown) => {
		if (payload === null || payload === undefined) {
			return "null";
		}
		try {
			return JSON.stringify(payload, null, 2);
		} catch {
			return String(payload);
		}
	};

	if (!isOpen) {
		return (
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="fixed top-4 left-4 z-50 inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium shadow-sm"
				aria-label="Open debug panel"
			>
				<svg
					className="h-4 w-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				Debug
			</button>
		);
	}

	return (
		<div className="fixed top-4 left-4 z-50 w-96 max-h-[calc(100vh-2rem)] bg-background border border-border rounded-lg shadow-lg flex flex-col">
			{/* Header */}
			<div className="flex items-center justify-between p-3 border-b border-border">
				<h2 className="text-sm font-semibold text-foreground">Debug Panel</h2>
				<button
					type="button"
					onClick={() => setIsOpen(false)}
					className="p-1 rounded hover:bg-accent transition-colors"
					aria-label="Close debug panel"
				>
					<svg
						className="h-4 w-4 text-muted-foreground"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto scrollbar-thin">
				{/* Events Section */}
				<div className="p-3 border-b border-border">
					<h3 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
						Events ({events.length})
					</h3>
					<div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
						{events.length === 0 ? (
							<p className="text-xs text-muted-foreground">No events yet</p>
						) : (
							events
								.slice()
								.reverse()
								.map((event, index) => (
									<div
										key={`${event.timestamp}-${index}`}
										className="p-2 rounded border border-border/50 bg-muted/30 text-xs"
									>
										<div className="flex items-center justify-between mb-1">
											<span className="font-medium text-foreground">
												{event.type}
											</span>
											<span className="text-muted-foreground">
												{formatTimestamp(event.timestamp)}
											</span>
										</div>
										{event.payload && (
											<pre className="mt-1 text-[10px] text-muted-foreground overflow-x-auto">
												{formatPayload(event.payload)}
											</pre>
										)}
									</div>
								))
						)}
					</div>
				</div>

				{/* UI Context Section */}
				<div className="p-3">
					<h3 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
						UI Context
					</h3>
					<div className="space-y-3 text-xs">
						{/* Route */}
						<div>
							<div className="text-muted-foreground mb-1">Route</div>
							<div className="font-mono p-2 rounded border border-border/50 bg-muted/30 text-foreground">
								{context.route || "/"}
							</div>
						</div>

						{/* State */}
						<div>
							<div className="text-muted-foreground mb-1">State</div>
							<pre className="p-2 rounded border border-border/50 bg-muted/30 text-[10px] text-foreground overflow-x-auto">
								{Object.keys(assistState).length === 0
									? "{}"
									: formatPayload(assistState)}
							</pre>
						</div>

						{/* Markers */}
						<div>
							<div className="text-muted-foreground mb-1">
								Markers ({context.markers.length})
							</div>
							<div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
								{context.markers.length === 0 ? (
									<p className="text-muted-foreground p-2 rounded border border-border/50 bg-muted/30">
										No markers
									</p>
								) : (
									context.markers.map((marker) => (
										<div
											key={marker.id}
											className="p-2 rounded border border-border/50 bg-muted/30"
										>
											<div className="font-medium text-foreground mb-1">
												{marker.id}
											</div>
											<div className="text-muted-foreground space-y-0.5">
												<div>
													<span className="font-medium">Label:</span>{" "}
													{marker.label}
												</div>
												<div>
													<span className="font-medium">Intent:</span>{" "}
													{marker.intent}
												</div>
											</div>
										</div>
									))
								)}
							</div>
						</div>

						{/* Error */}
						{lastError && (
							<div>
								<div className="text-muted-foreground mb-1">Last Error</div>
								<div className="p-2 rounded border border-destructive/50 bg-destructive/10">
									<div className="font-medium text-destructive mb-1">
										{lastError.error.message}
									</div>
									{lastError.meta && (
										<pre className="text-[10px] text-muted-foreground mt-1">
											{formatPayload(lastError.meta)}
										</pre>
									)}
									<div className="text-[10px] text-muted-foreground mt-1">
										{formatTimestamp(lastError.timestamp)}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
