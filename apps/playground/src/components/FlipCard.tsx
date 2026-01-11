import { Button } from "@ui4ai/ui";
import { useEffect, useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ReactNode } from "react";

interface FlipCardProps {
	children: ReactNode;
	code: string;
	language?: string;
}

export function FlipCard({ children, code, language = "tsx" }: FlipCardProps) {
	const [isFlipped, setIsFlipped] = useState(false);
	const [isDark, setIsDark] = useState(false);

	// Detect theme changes
	useEffect(() => {
		const checkTheme = () => {
			setIsDark(document.documentElement.classList.contains("dark"));
		};

		// Initial check
		checkTheme();

		// Listen for theme changes
		const handleThemeChange = () => {
			checkTheme();
		};

		// Use MutationObserver to watch for class changes on documentElement
		const observer = new MutationObserver(checkTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		// Also listen for custom themechange event
		window.addEventListener("themechange", handleThemeChange);

		return () => {
			observer.disconnect();
			window.removeEventListener("themechange", handleThemeChange);
		};
	}, []);

	// Select style based on theme
	const syntaxStyle = useMemo(() => {
		return isDark ? oneDark : oneLight;
	}, [isDark]);


	return (
		<div className="w-full">
			{/* Toggle Button */}
			<div className="flex justify-center mb-4">
				<Button
					type="button"
					onClick={() => setIsFlipped(!isFlipped)}
					className="flex items-center gap-2 px-4 py-2 rounded-sm border border-border bg-background text-foreground hover:bg-muted transition-colors text-sm font-medium"
				>
					<span>{isFlipped ? "👁️" : "💻"}</span>
					<span>{isFlipped ? "Show Demo" : "Show Code"}</span>
				</Button>
			</div>

			{/* 3D Flip Card Container */}
			<div
				className="relative w-full"
				style={{
					perspective: "1000px",
				}}
			>
				<div
					className="relative w-full"
					style={{
						transformStyle: "preserve-3d",
						transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
						transition: "transform 0.7s ease-in-out",
					}}
				>
					{/* Front Side - Demo Content */}
					<div
						className="w-full"
						style={{
							backfaceVisibility: "hidden",
							WebkitBackfaceVisibility: "hidden",
						}}
					>
						{children}
					</div>

					{/* Back Side - Code */}
					<div
						className="absolute inset-0 w-full"
						style={{
							backfaceVisibility: "hidden",
							WebkitBackfaceVisibility: "hidden",
							transform: "rotateY(180deg)",
						}}
					>
						<div className="flip-card-code rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-lg">
							<SyntaxHighlighter
								language={language}
								style={syntaxStyle}
								customStyle={{
									margin: 0,
									padding: "1rem",
									background: "transparent",
									fontSize: "0.875rem",
									lineHeight: "1.5",
								}}
								PreTag="div"
								codeTagProps={{
									style: {
										background: "transparent",
									},
								}}
							>
								{code}
							</SyntaxHighlighter>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
