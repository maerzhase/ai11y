import { type AgentConfig, UIAIProvider } from "@ui4ai/react";
import React from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { CustomHighlightWrapper } from "./components/Shared/CustomHighlight";
import { AppLayout } from "./layout/AppLayout";
import { HomePage } from "./pages/HomePage";

function App() {
	return (
		<BrowserRouter>
			<AppWithRouter />
		</BrowserRouter>
	);
}

function AppWithRouter() {
	const location = useLocation();
	const navigate = useNavigate();
	const locationRef = React.useRef(location.pathname);

	// Keep ref up to date
	React.useEffect(() => {
		locationRef.current = location.pathname;
	}, [location.pathname]);

	// Optional: Configure agent
	const apiEndpoint =
		import.meta.env.VITE_UI4AI_API_ENDPOINT ||
		"http://localhost:3000/ui4ai/agent";
	const agentConfig: AgentConfig = {
		apiEndpoint,
		mode: "auto" as const,
	};

	const handleNavigate = React.useCallback(
		(route: string) => {
			if (route !== locationRef.current) {
				navigate(route);
			}
		},
		[navigate],
	);

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
