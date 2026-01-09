import { Mark } from "@ui4ai/react";
import { CodeExampleCard } from "./CodeExampleCard";

const codeExamples = [
	{
		id: "mark",
		title: "Marking Elements",
		code: `import { Mark } from "@ui4ai/react";

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
		code: `import { useAssist } from "@ui4ai/react";

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
		code: `import { UIAIProvider, AssistPanel } from "@ui4ai/react";

function App() {
  return (
    <UIAIProvider onNavigate={(route) => navigate(route)}>
      <YourApp />
      <AssistPanel />
    </UIAIProvider>
  );
}`,
	},
	{
		id: "imperative",
		title: "Tool Functions",
		code: `import { navigateToRoute, highlightMarker, clickMarker } from "@ui4ai/core";
import { useAssist } from "@ui4ai/react";

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
					See how easy it is to integrate ui4ai into your app
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
