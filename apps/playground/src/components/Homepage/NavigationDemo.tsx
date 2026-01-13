import { Mark } from "@ui4ai/react";
import { Badge } from "@ui4ai/ui";
import { useLocation, useNavigate } from "react-router-dom";
import { SuggestionSection } from "../Shared/SuggestionSection";

export function NavigationDemo({
	onSuggestion,
}: {
	onSuggestion: (s: string) => void;
}) {
	const location = useLocation();
	const navigate = useNavigate();

	const routes = [
		{ path: "/", label: "Home", icon: "🏠" },
		{ path: "/billing", label: "Billing", icon: "💳" },
		{ path: "/integrations", label: "Integrations", icon: "🔌" },
	];

	const handleRouteClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
		path: string,
	) => {
		e.preventDefault();
		if (path !== location.pathname) {
			navigate(path);
		}
	};

	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground mb-3">
				The agent understands your routes:
			</div>
			<div className="space-y-2">
				{routes.map((route) => {
					const isCurrent = location.pathname === route.path;
					return (
						<Mark
							key={route.path}
							id={`nav_route_${route.path.replace("/", "") || "home"}`}
							label={`${route.label} Route`}
							intent={`Navigate to ${route.label} page`}
						>
							<a
								href={route.path}
								onClick={(e) => handleRouteClick(e, route.path)}
								className={`flex items-center gap-3 px-4 py-3 rounded-sm border transition-all ${
									isCurrent
										? "border-primary bg-primary/10 text-foreground"
										: "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
								}`}
							>
								<span className="text-lg">{route.icon}</span>
								<span className="font-medium">{route.label}</span>
								{isCurrent && (
									<Badge variant="primary" className="ml-auto">
										current
									</Badge>
								)}
							</a>
						</Mark>
					);
				})}
			</div>
			<SuggestionSection
				suggestions={["go to billing", "navigate to integrations"]}
				onSuggestion={onSuggestion}
			/>
		</div>
	);
}
