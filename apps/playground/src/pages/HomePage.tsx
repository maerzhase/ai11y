import { Mark, useAssist } from "@quest/react";
import { useNavigate } from "react-router-dom";
import { CodeBlock } from "../components/CodeBlock";

export function HomePage() {
	const navigate = useNavigate();
	const { navigate: assistNavigate } = useAssist();

	const handleNavigate = (route: string) => {
		navigate(route);
		assistNavigate(route);
	};

	return (
		<div className="w-full">
			{/* Hero Section */}
			<section className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
				<div className="relative max-w-4xl mx-auto text-center px-6 py-20">
					<Mark
						id="hero_title"
						label="Hero Title"
						intent="The main hero title of the landing page"
					>
						<h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent tracking-tight">
							AI-Powered Assistant
						</h1>
					</Mark>
					<p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
						Experience the future of in-app AI assistance. Navigate, interact,
						and explore with natural language.
					</p>
					<div className="flex gap-4 justify-center flex-wrap">
						<Mark
							id="get_started_button"
							label="Get Started"
							intent="Navigate to get started section"
						>
							<button
								type="button"
								onClick={() => {
									document
										.getElementById("features-section")
										?.scrollIntoView({ behavior: "smooth" });
								}}
								className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								Get Started
							</button>
						</Mark>
						<Mark
							id="explore_features_button"
							label="Explore Features"
							intent="Scroll to features section"
						>
							<button
								type="button"
								onClick={() => {
									document
										.getElementById("features-section")
										?.scrollIntoView({ behavior: "smooth" });
								}}
								className="inline-flex items-center justify-center rounded-lg border-2 border-border bg-background px-8 py-4 text-lg font-semibold text-foreground transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								Explore Features
							</button>
						</Mark>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section
				id="features-section"
				className="min-h-screen py-24 px-6 bg-background"
			>
				<div className="max-w-6xl mx-auto">
					<Mark
						id="features_title"
						label="Features Title"
						intent="The features section title"
					>
						<h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground tracking-tight">
							Powerful Features
						</h2>
					</Mark>
					<p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
						Try asking the assistant: "scroll to features", "highlight the
						navigation button", or "click get started"
					</p>

					<div className="grid md:grid-cols-3 gap-6 mb-16">
						<Mark
							id="feature_navigation"
							label="Navigation Feature"
							intent="Feature card about navigation"
						>
							<div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary/50">
								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="relative">
									<div className="w-12 h-12 rounded-lg bg-primary/10 mb-4 flex items-center justify-center text-primary">
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M8 7l4-4 4 4m0 6l-4 4-4-4"
											/>
										</svg>
									</div>
									<h3 className="text-xl font-semibold mb-2 text-card-foreground">
										Smart Navigation
									</h3>
									<p className="text-muted-foreground leading-relaxed">
										Navigate between pages using natural language. Try: "go to
										billing" or "take me to integrations"
									</p>
								</div>
							</div>
						</Mark>

						<Mark
							id="feature_highlight"
							label="Highlight Feature"
							intent="Feature card about highlighting"
						>
							<div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary/50">
								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="relative">
									<div className="w-12 h-12 rounded-lg bg-primary/10 mb-4 flex items-center justify-center text-primary">
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
											/>
										</svg>
									</div>
									<h3 className="text-xl font-semibold mb-2 text-card-foreground">
										Visual Highlighting
									</h3>
									<p className="text-muted-foreground leading-relaxed">
										Highlight elements with custom animations. Try: "highlight the
										features title" or "show me the navigation card"
									</p>
								</div>
							</div>
						</Mark>

						<Mark
							id="feature_scroll"
							label="Scroll Feature"
							intent="Feature card about scrolling"
						>
							<div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary/50">
								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="relative">
									<div className="w-12 h-12 rounded-lg bg-primary/10 mb-4 flex items-center justify-center text-primary">
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 14l-7 7m0 0l-7-7m7 7V3"
											/>
										</svg>
									</div>
									<h3 className="text-xl font-semibold mb-2 text-card-foreground">
										Smart Scrolling
									</h3>
									<p className="text-muted-foreground leading-relaxed">
										Scroll to any element on the page. Try: "scroll to the demo
										section" or "scroll to features"
									</p>
								</div>
							</div>
						</Mark>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-4 justify-center flex-wrap">
						<Mark
							id="navigate_billing_button"
							label="Navigate to Billing"
							intent="Navigate to the billing page"
						>
							<button
								onClick={() => handleNavigate("/billing")}
								className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								Go to Billing
							</button>
						</Mark>
						<Mark
							id="navigate_integrations_button"
							label="Navigate to Integrations"
							intent="Navigate to the integrations page"
						>
							<button
								onClick={() => handleNavigate("/integrations")}
								className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								Go to Integrations
							</button>
						</Mark>
					</div>
				</div>
			</section>

			{/* Code Examples Section */}
			<section
				id="code-examples-section"
				className="relative min-h-screen py-24 px-6 bg-muted/20"
			>
				<div className="max-w-6xl mx-auto">
					<Mark
						id="code_examples_title"
						label="Code Examples Title"
						intent="The code examples section title"
					>
						<h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground tracking-tight">
							Code Examples
						</h2>
					</Mark>
					<p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
						See how easy it is to integrate React Quest into your application
					</p>

					<div className="grid md:grid-cols-2 gap-8">
						{/* Mark Component Example */}
						<Mark
							id="code_example_mark"
							label="Mark Component Code Example"
							intent="Code example showing Mark component usage"
						>
							<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
								<h3 className="text-xl font-semibold mb-4 text-card-foreground">
									Marking Elements
								</h3>
								<CodeBlock
									code={`import { Mark } from "@quest/react";

<Mark
  id="my_button"
  label="My Button"
  intent="Perform an action"
>
  <button onClick={handleClick}>
    Click Me
  </button>
</Mark>`}
								/>
							</div>
						</Mark>

						{/* Navigation Example */}
						<Mark
							id="code_example_navigation"
							label="Navigation Code Example"
							intent="Code example showing navigation"
						>
							<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
								<h3 className="text-xl font-semibold mb-4 text-card-foreground">
									Navigation
								</h3>
								<CodeBlock
									code={`import { useAssist } from "@quest/react";

function MyComponent() {
  const { navigate } = useAssist();
  
  return (
    <button onClick={() => navigate("/billing")}>
      Go to Billing
    </button>
  );
}`}
								/>
							</div>
						</Mark>

						{/* Highlighting Example */}
						<Mark
							id="code_example_highlight"
							label="Highlight Code Example"
							intent="Code example showing highlighting"
						>
							<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
								<h3 className="text-xl font-semibold mb-4 text-card-foreground">
									Visual Highlighting
								</h3>
								<CodeBlock
									code={`import { useAssist } from "@quest/react";

function MyComponent() {
  const { highlight } = useAssist();
  
  const handleClick = () => {
    highlight("my_button");
  };
  
  return <button onClick={handleClick}>Highlight</button>;
}`}
								/>
							</div>
						</Mark>

						{/* Error Reporting Example */}
						<Mark
							id="code_example_error"
							label="Error Reporting Code Example"
							intent="Code example showing error reporting"
						>
							<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
								<h3 className="text-xl font-semibold mb-4 text-card-foreground">
									Error Reporting
								</h3>
								<CodeBlock
									code={`import { useAssist } from "@quest/react";

function MyComponent() {
  const { reportError } = useAssist();
  
  const handleAction = async () => {
    try {
      await doSomething();
    } catch (error) {
      reportError(error, {
        markerId: "my_button"
      });
    }
  };
}`}
								/>
							</div>
						</Mark>

						{/* Setup Example */}
						<Mark
							id="code_example_setup"
							label="Setup Code Example"
							intent="Code example showing basic setup"
						>
							<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
								<h3 className="text-xl font-semibold mb-4 text-card-foreground">
									Basic Setup
								</h3>
								<CodeBlock
									code={`import { AssistProvider, AssistPanel } from "@quest/react";

function App() {
  return (
    <AssistProvider onNavigate={(route) => navigate(route)}>
      <YourApp />
      <AssistPanel />
    </AssistProvider>
  );
}`}
								/>
							</div>
						</Mark>

						{/* Imperative API Example */}
						<Mark
							id="code_example_imperative"
							label="Imperative API Code Example"
							intent="Code example showing imperative API"
						>
							<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
								<h3 className="text-xl font-semibold mb-4 text-card-foreground">
									Imperative API
								</h3>
								<CodeBlock
									code={`import { useAssist } from "@quest/react";

function MyComponent() {
  const { navigate, highlight, click, track } = useAssist();
  
  const handleAction = () => {
    track("custom_event");
    navigate("/billing");
    highlight("some_marker");
    click("another_marker");
  };
}`}
								/>
							</div>
						</Mark>
					</div>
				</div>
			</section>

			{/* Demo Section */}
			<section
				id="demo-section"
				className="relative min-h-screen py-24 px-6 overflow-hidden"
			>
				<div className="absolute inset-0 bg-muted/30" />
				<div className="relative max-w-4xl mx-auto">
					<Mark
						id="demo_title"
						label="Demo Section Title"
						intent="The demo section title"
					>
						<h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground tracking-tight">
							Try It Out
						</h2>
					</Mark>
					<p className="text-center text-muted-foreground mb-12 text-lg max-w-2xl mx-auto">
						Interact with the assistant panel in the bottom right corner. Here
						are some example commands:
					</p>

					<div className="rounded-xl border border-border bg-card p-8 shadow-lg mb-8">
						<h3 className="text-2xl font-semibold mb-6 text-card-foreground">
							Example Commands
						</h3>
						<div className="space-y-3">
							<Mark
								id="command_navigate"
								label="Navigate Command Example"
								intent="Example command for navigation"
							>
								<div className="rounded-lg border border-border bg-muted/50 p-4">
									<code className="text-sm text-foreground font-mono">
										"go to billing" or "navigate to integrations"
									</code>
								</div>
							</Mark>
							<Mark
								id="command_highlight"
								label="Highlight Command Example"
								intent="Example command for highlighting"
							>
								<div className="rounded-lg border border-border bg-muted/50 p-4">
									<code className="text-sm text-foreground font-mono">
										"highlight the hero title" or "show me the features section"
									</code>
								</div>
							</Mark>
							<Mark
								id="command_scroll"
								label="Scroll Command Example"
								intent="Example command for scrolling"
							>
								<div className="rounded-lg border border-border bg-muted/50 p-4">
									<code className="text-sm text-foreground font-mono">
										"scroll to demo section" or "scroll to features"
									</code>
								</div>
							</Mark>
							<Mark
								id="command_click"
								label="Click Command Example"
								intent="Example command for clicking"
							>
								<div className="rounded-lg border border-border bg-muted/50 p-4">
									<code className="text-sm text-foreground font-mono">
										"click get started" or "press the billing button"
									</code>
								</div>
							</Mark>
						</div>
					</div>

					<div className="text-center">
						<Mark
							id="open_assistant_button"
							label="Open Assistant"
							intent="Button to open the assistant panel"
						>
							<button
								onClick={() => {
									// The assistant panel can be opened programmatically
									// For now, we'll just show a message
									alert(
										"Click the chat icon in the bottom right corner to open the assistant!",
									);
								}}
								className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								Open Assistant Panel
							</button>
						</Mark>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border bg-muted/30 py-12 px-6">
				<div className="max-w-6xl mx-auto text-center">
					<p className="text-muted-foreground">
						Built with React Quest - AI Assistant SDK
					</p>
				</div>
			</footer>
		</div>
	);
}
