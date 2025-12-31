import { navigateToRoute } from "@quest/core";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogoCircular } from "../components/LogoCircular";
import { ThemeToggle } from "../components/ThemeToggle";

interface AppLayoutProps {
	children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
	const location = useLocation();

	// Sync React Router location with core store
	React.useEffect(() => {
		navigateToRoute(location.pathname);
	}, [location.pathname]);

	return (
		<div className="min-h-screen bg-background text-foreground transition-colors">
			<nav className="sticky top-0 z-200 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
					<div className="flex items-center gap-6">
						<Link
							to="/"
							className="flex items-center gap-3 font-semibold text-foreground no-underline hover:opacity-80 transition-opacity"
						>
							<LogoCircular />
							<span className="text-lg">React Quest</span>
						</Link>
						<nav className="flex items-center gap-6 text-sm">
							<Link
								to="/"
								className={`transition-colors hover:text-foreground/80 ${
									location.pathname === "/"
										? "text-foreground font-medium"
										: "text-muted-foreground"
								}`}
							>
								Home
							</Link>
							<Link
								to="/billing"
								className={`transition-colors hover:text-foreground/80 ${
									location.pathname === "/billing"
										? "text-foreground font-medium"
										: "text-muted-foreground"
								}`}
							>
								Billing
							</Link>
							<Link
								to="/integrations"
								className={`transition-colors hover:text-foreground/80 ${
									location.pathname === "/integrations"
										? "text-foreground font-medium"
										: "text-muted-foreground"
								}`}
							>
								Integrations
							</Link>
						</nav>
					</div>
					<ThemeToggle />
				</div>
			</nav>
			{children}
		</div>
	);
}
