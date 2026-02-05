import { type AgentConfig, Ai11yProvider } from "@ai11y/react";
import React from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { CustomHighlightWrapper } from "./components/Shared/CustomHighlight";
import { DemoUiProvider } from "./context/DemoUiContext";
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
		import.meta.env.VITE_AI11Y_API_ENDPOINT ||
		"http://localhost:3000/ai11y/agent";
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
		<Ai11yProvider onNavigate={handleNavigate} agentConfig={agentConfig}>
			<DemoUiProvider highlightWrapper={CustomHighlightWrapper}>
				<AppLayout>
					<HomePage />
				</AppLayout>
			</DemoUiProvider>
		</Ai11yProvider>
	);
}

export default App;
