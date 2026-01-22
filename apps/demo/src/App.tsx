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

	const apiEndpoint =
		import.meta.env.VITE_UI4AI_API_ENDPOINT ||
		"http://localhost:3000/ui4ai/agent";
	const agentConfig: AgentConfig = {
		apiEndpoint,
		mode: "auto" as const,
	};

	const handleNavigate = React.useCallback(
		(route: string) => {
			if (route !== location.pathname) {
				navigate(route);
			}
		},
		[navigate, location.pathname],
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
