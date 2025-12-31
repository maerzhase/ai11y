import { AgentConfig, AssistPanel, UIAIProvider } from "@quest/react";
import React from "react";
import {
	BrowserRouter,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from "react-router-dom";
import { CustomHighlightWrapper } from "./components/CustomHighlight";
import { AppLayout } from "./layout/AppLayout";
import { BillingPage } from "./pages/BillingPage";
import { HomePage } from "./pages/HomePage";
import { IntegrationsPage } from "./pages/IntegrationsPage";

function App() {
	return (
		<BrowserRouter>
			<AppWithRouter />
		</BrowserRouter>
	);
}

function AppWithRouter() {
	const navigate = useNavigate();
	const location = useLocation();
	const navigateRef = React.useRef(navigate);
	const locationRef = React.useRef(location.pathname);

	// Keep refs up to date
	React.useEffect(() => {
		navigateRef.current = navigate;
		locationRef.current = location.pathname;
	}, [navigate, location.pathname]);

	// Optional: Configure agent
	const apiEndpoint =
		import.meta.env.VITE_QUEST_API_ENDPOINT ||
		"http://localhost:3000/quest/agent";
	const agentConfig: AgentConfig = {
		apiEndpoint,
		mode: "auto" as const,
	};

	return (
		<UIAIProvider
			onNavigate={(route) => {
				// When assistant navigates, update React Router
				if (route !== locationRef.current) {
					navigateRef.current(route);
				}
			}}
			highlightWrapper={CustomHighlightWrapper}
			agentConfig={agentConfig}
		>
			<AppLayout>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/billing" element={<BillingPage />} />
					<Route path="/integrations" element={<IntegrationsPage />} />
				</Routes>
				<AssistPanel />
			</AppLayout>
		</UIAIProvider>
	);
}

export default App;
