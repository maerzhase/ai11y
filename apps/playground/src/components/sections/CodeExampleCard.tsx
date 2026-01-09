import { Mark } from "@ui4ai/react";
import { Card, CardHeader, CardTitle, Text } from "@ui4ai/ui";
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
			<Card padding="lg">
				<CardHeader>
					<CardTitle>{title}</CardTitle>
				</CardHeader>
				<CodeBlock code={code} />
			</Card>
		</Mark>
	);
}
