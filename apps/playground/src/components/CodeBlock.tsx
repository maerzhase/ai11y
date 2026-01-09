interface CodeBlockProps {
	code: string;
	language?: string;
}

export function CodeBlock({ code, language = "tsx" }: CodeBlockProps) {
	// Trim the code to remove leading/trailing whitespace
	const trimmedCode = code.trim();

	return (
		<div className="overflow-x-auto rounded-sm bg-muted">
			<pre className="m-0 p-4 rounded-sm text-sm font-mono text-foreground">
				<code>{trimmedCode}</code>
			</pre>
		</div>
	);
}
