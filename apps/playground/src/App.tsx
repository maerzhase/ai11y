import { AssistPanel, AssistProvider } from "@quest/react";
import React from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { CustomHighlightWrapper } from "./components/CustomHighlight";
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

	// Optional: Configure LLM agent
	const apiEndpoint =
		import.meta.env.VITE_QUEST_API_ENDPOINT ||
		"http://localhost:3000/quest/agent";
	const llmConfig = {
		apiEndpoint,
	};

	return (
		<AssistProvider
			onNavigate={(route) => {
				// When assistant navigates, update React Router
				if (route !== locationRef.current) {
					navigateRef.current(route);
				}
			}}
			onHighlight={(markerId, element) => {
				// Event handler for side effects (analytics, logging, etc.)
				console.log(`Highlighted marker: ${markerId}`, element);
				// You can also do DOM manipulation here if needed
			}}
			highlightWrapper={CustomHighlightWrapper}
			llmConfig={llmConfig || undefined}
		>
			<AppLayout>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/billing" element={<BillingPage />} />
					<Route path="/integrations" element={<IntegrationsPage />} />
				</Routes>
				<AssistPanel />
			</AppLayout>
		</AssistProvider>
	);
}

export default App;
