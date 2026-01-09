import { Mark } from "@ui4ai/react";
import { CodeBlock } from "../CodeBlock";

interface CodeExampleCardProps {
	id: string;
	title: string;
	code: string;
}

export function CodeExampleCard({ id, title, code }: CodeExampleCardProps) {
	return (
		<Mark
			id={`code_example_${id}`}
			label={`${title} Code Example`}
			intent={`Code example showing ${title.toLowerCase()}`}
		>
			<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
				<h3 className="text-xl font-semibold mb-4 text-card-foreground">
					{title}
				</h3>
				<CodeBlock code={code} />
			</div>
		</Mark>
	);
}
