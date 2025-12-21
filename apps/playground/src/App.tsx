import React, { useState } from "react";
import { AssistPanel, AssistProvider, Mark, useAssist } from "@quest/react";
import {
	BrowserRouter,
	Link,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from "react-router-dom";

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
	// To use the LLM agent, you need to run the server:
	// 1. Set up the server with your API key (see apps/server/README.md)
	// 2. Run the server: pnpm --filter @react-quest/server-app dev
	// 3. Optionally set VITE_QUEST_API_ENDPOINT (defaults to http://localhost:3000/quest/agent)
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
			llmConfig={llmConfig || undefined}
		>
			<AppContent />
		</AssistProvider>
	);
}

function AppContent() {
	const location = useLocation();
	const { navigate: assistNavigate } = useAssist();

	// Sync React Router location with AssistProvider
	React.useEffect(() => {
		assistNavigate(location.pathname);
	}, [location.pathname, assistNavigate]);

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white border-b border-gray-200 px-6 py-4 flex gap-6 items-center">
				<h1 className="m-0 text-xl font-semibold">Demo App</h1>
				<div className="flex gap-4">
					<Link
						to="/"
						className={`no-underline ${
							location.pathname === "/"
								? "text-blue-500 font-semibold"
								: "text-gray-500 font-normal"
						}`}
					>
						Home
					</Link>
					<Link
						to="/billing"
						className={`no-underline ${
							location.pathname === "/billing"
								? "text-blue-500 font-semibold"
								: "text-gray-500 font-normal"
						}`}
					>
						Billing
					</Link>
					<Link
						to="/integrations"
						className={`no-underline ${
							location.pathname === "/integrations"
								? "text-blue-500 font-semibold"
								: "text-gray-500 font-normal"
						}`}
					>
						Integrations
					</Link>
				</div>
			</nav>

			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/billing" element={<BillingPage />} />
				<Route path="/integrations" element={<IntegrationsPage />} />
			</Routes>

			<AssistPanel />
		</div>
	);
}

function HomePage() {
	const navigate = useNavigate();
	const { navigate: assistNavigate } = useAssist();

	const handleNavigate = (route: string) => {
		navigate(route);
		assistNavigate(route);
	};

	return (
		<div className="p-12 max-w-3xl mx-auto">
			<h2 className="text-3xl mb-4">Welcome Home</h2>
			<p className="text-gray-500 mb-8 text-base">
				This is a demo app showcasing the AI assistant SDK. Try asking the
				assistant to navigate or click buttons!
			</p>

			<div className="flex flex-col gap-4">
				<Mark
					id="go_to_billing"
					label="Go to Billing"
					intent="Navigate to the billing page"
				>
					<button
						onClick={() => handleNavigate("/billing")}
						className="px-6 py-3 bg-blue-500 text-white border-none rounded-lg cursor-pointer text-base font-medium hover:bg-blue-600 transition-colors"
					>
						Go to Billing
					</button>
				</Mark>

				<Mark
					id="go_to_integrations"
					label="Go to Integrations"
					intent="Navigate to the integrations page"
				>
					<button
						onClick={() => handleNavigate("/integrations")}
						className="px-6 py-3 bg-emerald-500 text-white border-none rounded-lg cursor-pointer text-base font-medium hover:bg-emerald-600 transition-colors"
					>
						Go to Integrations
					</button>
				</Mark>
			</div>
		</div>
	);
}

function BillingPage() {
	const [billingEnabled, setBillingEnabled] = useState(false);

	return (
		<div className="p-12 max-w-3xl mx-auto">
			<h2 className="text-3xl mb-4">Billing</h2>
			<p className="text-gray-500 mb-8 text-base">
				Manage your billing settings here.
			</p>

			<div className="bg-white p-6 rounded-xl border border-gray-200">
				<h3 className="mt-0 mb-4">Billing Status</h3>
				<p className="text-gray-500 mb-6">
					Billing is currently:{" "}
					<strong>{billingEnabled ? "Enabled" : "Disabled"}</strong>
				</p>

				<Mark
					id="enable_billing"
					label="Enable Billing"
					intent="Enable billing for your account"
				>
					<button
						onClick={() => setBillingEnabled(true)}
						disabled={billingEnabled}
						className={`px-6 py-3 text-white border-none rounded-lg text-base font-medium transition-colors ${
							billingEnabled
								? "bg-gray-500 cursor-not-allowed"
								: "bg-blue-500 cursor-pointer hover:bg-blue-600"
						}`}
					>
						{billingEnabled ? "Billing Enabled" : "Enable Billing"}
					</button>
				</Mark>
			</div>
		</div>
	);
}

function IntegrationsPage() {
	const { reportError } = useAssist();
	const [hasFailed, setHasFailed] = useState(false);
	const [isConnected, setIsConnected] = useState(false);

	const handleConnectStripe = () => {
		if (!hasFailed) {
			// Simulate failure on first click
			setHasFailed(true);
			const error = new Error(
				"Failed to connect to Stripe API. Please check your credentials.",
			);
			reportError(error, {
				surface: "integrations",
				markerId: "connect_stripe",
			});
		} else {
			// Retry - succeed this time
			setIsConnected(true);
			setHasFailed(false);
		}
	};

	return (
		<div className="p-12 max-w-3xl mx-auto">
			<h2 className="text-3xl mb-4">Integrations</h2>
			<p className="text-gray-500 mb-8 text-base">
				Connect third-party services to enhance your app.
			</p>

			<div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
				<h3 className="mt-0 mb-2">Stripe</h3>
				<p className="text-gray-500 mb-4 text-sm">
					Connect Stripe to accept payments
				</p>
				{isConnected ? (
					<div className="px-4 py-3 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium">
						✓ Connected
					</div>
				) : (
					<Mark
						id="connect_stripe"
						label="Connect Stripe"
						intent="Connect Stripe to accept payments"
					>
						<button
							onClick={handleConnectStripe}
							className="px-6 py-3 bg-indigo-500 text-white border-none rounded-lg cursor-pointer text-base font-medium hover:bg-indigo-600 transition-colors"
						>
							{hasFailed ? "Retry Connection" : "Connect Stripe"}
						</button>
					</Mark>
				)}
				{hasFailed && !isConnected && (
					<p className="text-red-600 mt-3 text-sm">
						Connection failed. Ask the assistant to retry!
					</p>
				)}
			</div>
		</div>
	);
}

export default App;
