import React from "react";
import { Mark } from "@quest/react";
import { CodeExampleCard } from "./CodeExampleCard";

const codeExamples = [
	{
		id: "mark",
		title: "Marking Elements",
		code: `import { Mark } from "@quest/react";

<Mark
  id="my_button"
  label="My Button"
  intent="Perform an important action"
>
  <button onClick={handleClick}>
    Click Me
  </button>
</Mark>`,
	},
	{
		id: "error",
		title: "Error Reporting",
		code: `import { useAssist } from "@quest/react";

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
}`,
	},
	{
		id: "setup",
		title: "Basic Setup",
		code: `import { AssistProvider, AssistPanel } from "@quest/react";

function App() {
  return (
    <AssistProvider onNavigate={(route) => navigate(route)}>
      <YourApp />
      <AssistPanel />
    </AssistProvider>
  );
}`,
	},
	{
		id: "imperative",
		title: "Tool Functions",
		code: `import { navigateToRoute, highlightMarker, clickMarker } from "@quest/core";
import { useAssist } from "@quest/react";

function MyComponent() {
  const { track } = useAssist();
  
  const handleAction = () => {
    track("custom_event");
    navigateToRoute("/billing");
    highlightMarker("some_marker");
    clickMarker("another_marker");
  };
}`,
	},
];

export function CodeExamplesSection() {
	return (
		<section id="code-examples-section" className="py-24 px-6 bg-background">
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
					See how easy it is to integrate React Quest
				</p>

				<div className="grid md:grid-cols-2 gap-8">
					{codeExamples.map((example) => (
						<CodeExampleCard key={example.id} {...example} />
					))}
				</div>
			</div>
		</section>
	);
}

