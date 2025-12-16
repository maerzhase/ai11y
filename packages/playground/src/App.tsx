import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { AssistProvider, AssistPanel, Mark, useAssist } from "react-quest";

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

	return (
		<AssistProvider
			onNavigate={(route) => {
				// When assistant navigates, update React Router
				if (route !== locationRef.current) {
					navigateRef.current(route);
				}
			}}
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
		<div style={{ minHeight: "100vh", background: "#f9fafb" }}>
			<nav
				style={{
					background: "white",
					borderBottom: "1px solid #e5e7eb",
					padding: "16px 24px",
					display: "flex",
					gap: 24,
					alignItems: "center",
				}}
			>
				<h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
					Demo App
				</h1>
				<div style={{ display: "flex", gap: 16 }}>
					<Link
						to="/"
						style={{
							textDecoration: "none",
							color: location.pathname === "/" ? "#3b82f6" : "#6b7280",
							fontWeight: location.pathname === "/" ? 600 : 400,
						}}
					>
						Home
					</Link>
					<Link
						to="/billing"
						style={{
							textDecoration: "none",
							color: location.pathname === "/billing" ? "#3b82f6" : "#6b7280",
							fontWeight: location.pathname === "/billing" ? 600 : 400,
						}}
					>
						Billing
					</Link>
					<Link
						to="/integrations"
						style={{
							textDecoration: "none",
							color: location.pathname === "/integrations" ? "#3b82f6" : "#6b7280",
							fontWeight: location.pathname === "/integrations" ? 600 : 400,
						}}
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
		<div style={{ padding: 48, maxWidth: 800, margin: "0 auto" }}>
			<h2 style={{ fontSize: 32, marginBottom: 16 }}>Welcome Home</h2>
			<p style={{ color: "#6b7280", marginBottom: 32, fontSize: 16 }}>
				This is a demo app showcasing the AI assistant SDK. Try asking the
				assistant to navigate or click buttons!
			</p>

			<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
				<Mark
					id="go_to_billing"
					label="Go to Billing"
					intent="Navigate to the billing page"
					action={() => handleNavigate("/billing")}
				>
					<button
						style={{
							padding: "12px 24px",
							background: "#3b82f6",
							color: "white",
							border: "none",
							borderRadius: 8,
							cursor: "pointer",
							fontSize: 16,
							fontWeight: 500,
						}}
					>
						Go to Billing
					</button>
				</Mark>

				<Mark
					id="go_to_integrations"
					label="Go to Integrations"
					intent="Navigate to the integrations page"
					action={() => handleNavigate("/integrations")}
				>
					<button
						style={{
							padding: "12px 24px",
							background: "#10b981",
							color: "white",
							border: "none",
							borderRadius: 8,
							cursor: "pointer",
							fontSize: 16,
							fontWeight: 500,
						}}
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
		<div style={{ padding: 48, maxWidth: 800, margin: "0 auto" }}>
			<h2 style={{ fontSize: 32, marginBottom: 16 }}>Billing</h2>
			<p style={{ color: "#6b7280", marginBottom: 32, fontSize: 16 }}>
				Manage your billing settings here.
			</p>

			<div
				style={{
					background: "white",
					padding: 24,
					borderRadius: 12,
					border: "1px solid #e5e7eb",
				}}
			>
				<h3 style={{ marginTop: 0, marginBottom: 16 }}>Billing Status</h3>
				<p style={{ color: "#6b7280", marginBottom: 24 }}>
					Billing is currently:{" "}
					<strong>{billingEnabled ? "Enabled" : "Disabled"}</strong>
				</p>

				<Mark
					id="enable_billing"
					label="Enable Billing"
					intent="Enable billing for your account"
					action={() => {
						setBillingEnabled(true);
					}}
				>
					<button
						style={{
							padding: "12px 24px",
							background: billingEnabled ? "#6b7280" : "#3b82f6",
							color: "white",
							border: "none",
							borderRadius: 8,
							cursor: billingEnabled ? "not-allowed" : "pointer",
							fontSize: 16,
							fontWeight: 500,
							disabled: billingEnabled,
						}}
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
			const error = new Error("Failed to connect to Stripe API. Please check your credentials.");
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
		<div style={{ padding: 48, maxWidth: 800, margin: "0 auto" }}>
			<h2 style={{ fontSize: 32, marginBottom: 16 }}>Integrations</h2>
			<p style={{ color: "#6b7280", marginBottom: 32, fontSize: 16 }}>
				Connect third-party services to enhance your app.
			</p>

			<div
				style={{
					background: "white",
					padding: 24,
					borderRadius: 12,
					border: "1px solid #e5e7eb",
					marginBottom: 24,
				}}
			>
				<h3 style={{ marginTop: 0, marginBottom: 8 }}>Stripe</h3>
				<p style={{ color: "#6b7280", marginBottom: 16, fontSize: 14 }}>
					Connect Stripe to accept payments
				</p>
				{isConnected ? (
					<div
						style={{
							padding: "12px 16px",
							background: "#d1fae5",
							color: "#065f46",
							borderRadius: 8,
							fontSize: 14,
							fontWeight: 500,
						}}
					>
						✓ Connected
					</div>
				) : (
					<Mark
						id="connect_stripe"
						label="Connect Stripe"
						intent="Connect Stripe to accept payments"
						action={handleConnectStripe}
					>
						<button
							style={{
								padding: "12px 24px",
								background: "#6366f1",
								color: "white",
								border: "none",
								borderRadius: 8,
								cursor: "pointer",
								fontSize: 16,
								fontWeight: 500,
							}}
						>
							{hasFailed ? "Retry Connection" : "Connect Stripe"}
						</button>
					</Mark>
				)}
				{hasFailed && !isConnected && (
					<p style={{ color: "#dc2626", marginTop: 12, fontSize: 14 }}>
						Connection failed. Ask the assistant to retry!
					</p>
				)}
			</div>
		</div>
	);
}

export default App;
