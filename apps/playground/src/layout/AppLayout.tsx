import { navigateToRoute } from "@quest/core";
import React from "react";
import { useDemoRoute } from "../context/DemoRouteContext";

interface AppLayoutProps {
	children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
	const { demoRoute } = useDemoRoute();

	// Sync demo route with core store
	React.useEffect(() => {
		navigateToRoute(demoRoute);
	}, [demoRoute]);

	return (
		<div className="min-h-screen bg-background text-foreground transition-colors">
			{children}
		</div>
	);
}
