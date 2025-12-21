import { useEffect, useState } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import {
	oneDark,
	oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
	code: string;
	language?: string;
}

// Register languages - must be done at module level before component usage
if (SyntaxHighlighter?.registerLanguage) {
	SyntaxHighlighter.registerLanguage("tsx", tsx);
	SyntaxHighlighter.registerLanguage("typescript", typescript);
	SyntaxHighlighter.registerLanguage("jsx", jsx);
	SyntaxHighlighter.registerLanguage("javascript", javascript);
}

export function CodeBlock({ code, language = "tsx" }: CodeBlockProps) {
	// Trim the code to remove leading/trailing whitespace
	const trimmedCode = code.trim();

	// Detect dark mode and react to theme changes
	const [isDark, setIsDark] = useState(() => {
		if (typeof window === "undefined") return false;
		return document.documentElement.classList.contains("dark");
	});

	useEffect(() => {
		// Check initial state
		const checkTheme = () => {
			setIsDark(document.documentElement.classList.contains("dark"));
		};

		// Watch for class changes on the document element
		const observer = new MutationObserver(checkTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		// Also check on initial mount
		checkTheme();

		return () => observer.disconnect();
	}, []);

	const theme = isDark ? oneDark : oneLight;

	return (
		<div className="overflow-x-auto rounded-lg bg-muted">
			<SyntaxHighlighter
				language={language}
				style={theme}
				customStyle={{
					margin: 0,
					padding: "1rem",
					borderRadius: "0.5rem",
					background: "hsl(var(--muted))",
					fontSize: "0.875rem",
					fontFamily: '"Geist Mono", "Courier New", monospace',
				}}
				codeTagProps={{
					style: {
						fontFamily: '"Geist Mono", "Courier New", monospace',
					},
				}}
				PreTag="div"
				showLineNumbers={false}
				wrapLines={false}
			>
				{trimmedCode}
			</SyntaxHighlighter>
		</div>
	);
}
