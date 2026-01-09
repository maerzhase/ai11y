import { Mark } from "@ui4ai/react";
import { CodeBlock } from "../CodeBlock";

export function QuickStartGuide() {
	return (
		<section id="quick-start" className="py-24 px-6 bg-muted/30">
			<div className="max-w-4xl mx-auto">
				<Mark
					id="quick_start_title"
					label="Quick Start Title"
					intent="Quick start guide section"
				>
					<h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground tracking-tight">
						Get Started in 3 Steps
					</h2>
				</Mark>
				<p className="text-center text-muted-foreground mb-12 text-lg">
					Add AI assistance to your app in minutes
				</p>

				<div className="space-y-8">
					{/* Step 1 */}
					<Mark
						id="step_1_wrap"
						label="Step 1: Wrap Your App"
						intent="Step 1 of quick start guide"
					>
						<div className="rounded-xl border border-border bg-card p-8 shadow-sm">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
									1
								</div>
								<div className="flex-1">
									<h3 className="text-2xl font-semibold mb-3 text-card-foreground">
										Wrap Your App
									</h3>
									<p className="text-muted-foreground mb-4">
										Add{" "}
										<code className="px-2 py-1 bg-muted rounded text-sm">
											UIAIProvider
										</code>{" "}
										and{" "}
										<code className="px-2 py-1 bg-muted rounded text-sm">
											AssistPanel
										</code>{" "}
										to your app
									</p>
									<CodeBlock
										code={`import { UIAIProvider, AssistPanel } from "@ui4ai/react";

function App() {
  return (
    <UIAIProvider onNavigate={(route) => navigate(route)}>
      <YourApp />
      <AssistPanel />
    </UIAIProvider>
  );
}`}
									/>
								</div>
							</div>
						</div>
					</Mark>

					{/* Step 2 */}
					<Mark
						id="step_2_mark"
						label="Step 2: Mark Elements"
						intent="Step 2 of quick start guide"
					>
						<div className="rounded-xl border border-border bg-card p-8 shadow-sm">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
									2
								</div>
								<div className="flex-1">
									<h3 className="text-2xl font-semibold mb-3 text-card-foreground">
										Mark Interactive Elements
									</h3>
									<p className="text-muted-foreground mb-4">
										Wrap buttons, links, and other elements with the{" "}
										<code className="px-2 py-1 bg-muted rounded text-sm">
											Mark
										</code>{" "}
										component
									</p>
									<CodeBlock
										code={`import { Mark } from "@ui4ai/react";

<Mark
  id="my_button"
  label="My Button"
  intent="Perform an important action"
>
  <button onClick={handleClick}>
    Click Me
  </button>
</Mark>`}
									/>
								</div>
							</div>
						</div>
					</Mark>

					{/* Step 3 */}
					<Mark
						id="step_3_talk"
						label="Step 3: Talk to Your App"
						intent="Step 3 of quick start guide"
					>
						<div className="rounded-xl border border-border bg-card p-8 shadow-sm">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
									3
								</div>
								<div className="flex-1">
									<h3 className="text-2xl font-semibold mb-3 text-card-foreground">
										Talk to Your App
									</h3>
									<p className="text-muted-foreground mb-4">
										Users can now interact with your app using natural language!
									</p>
									<div className="rounded-lg border border-border bg-muted/50 p-4 mb-4">
										<p className="text-sm text-muted-foreground mb-2">
											Try saying:
										</p>
										<ul className="list-disc list-inside space-y-1 text-sm text-foreground">
											<li>
												<code className="px-1.5 py-0.5 bg-background rounded">
													"click my button"
												</code>
											</li>
											<li>
												<code className="px-1.5 py-0.5 bg-background rounded">
													"highlight the hero title"
												</code>
											</li>
											<li>
												<code className="px-1.5 py-0.5 bg-background rounded">
													"go to billing"
												</code>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</Mark>
				</div>
			</div>
		</section>
	);
}
