import { type AgentConfig, UIAIProvider } from "@quest/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { CustomHighlightWrapper } from "./components/CustomHighlight";
import { DemoRouteProvider, useDemoRoute } from "./context/DemoRouteContext";
import { AppLayout } from "./layout/AppLayout";
import { HomePage } from "./pages/HomePage";

function App() {
	return (
		<BrowserRouter>
			<DemoRouteProvider>
				<AppWithRouter />
			</DemoRouteProvider>
		</BrowserRouter>
	);
}

function AppWithRouter() {
	const { demoRoute, setDemoRoute } = useDemoRoute();
	const demoRouteRef = React.useRef(demoRoute);

	// Keep ref up to date
	React.useEffect(() => {
		demoRouteRef.current = demoRoute;
	}, [demoRoute]);

	// Optional: Configure agent
	const apiEndpoint =
		import.meta.env.VITE_QUEST_API_ENDPOINT ||
		"http://localhost:3000/quest/agent";
	const agentConfig: AgentConfig = {
		apiEndpoint,
		mode: "auto" as const,
	};

	const handleNavigate = React.useCallback(
		(route: string) => {
			if (route !== demoRouteRef.current) {
				// Update URL without page navigation
				window.history.pushState({}, "", route);
				// Update demo route state
				setDemoRoute(route);
			}
		},
		[setDemoRoute]
	);

	// Listen for popstate (browser back/forward)
	React.useEffect(() => {
		const handlePopState = () => {
			setDemoRoute(window.location.pathname);
		};
		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, [setDemoRoute]);

	return (
		<UIAIProvider
			onNavigate={handleNavigate}
			highlightWrapper={CustomHighlightWrapper}
			agentConfig={agentConfig}
		>
			<AppLayout>
				<HomePage />
			</AppLayout>
		</UIAIProvider>
	);
}

export default App;
