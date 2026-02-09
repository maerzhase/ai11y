import { Button } from "@ai11y/ui";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	oneDark,
	oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

type Tab = "javascript" | "react";

interface FlipCardProps {
	children: ReactNode;
	code: string;
	language?: string;
	/** When provided, show JavaScript | React tabs on the code side. */
	reactCode?: string;
	reactLanguage?: string;
}

export function FlipCard({
	children,
	code,
	language = "tsx",
	reactCode,
	reactLanguage = "tsx",
}: FlipCardProps) {
	const [isFlipped, setIsFlipped] = useState(false);
	const [codeTab, setCodeTab] = useState<Tab>("javascript");
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
						<div className="flip-card-code rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-lg">
							{reactCode ? (
								<>
									<div className="flex border-b border-border/50 bg-muted/30">
										<button
											type="button"
											onClick={() => setCodeTab("javascript")}
											className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
												codeTab === "javascript"
													? "bg-background text-foreground border-b-2 border-primary"
													: "text-muted-foreground hover:text-foreground"
											}`}
										>
											JavaScript
										</button>
										<button
											type="button"
											onClick={() => setCodeTab("react")}
											className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
												codeTab === "react"
													? "bg-background text-foreground border-b-2 border-primary"
													: "text-muted-foreground hover:text-foreground"
											}`}
										>
											React
										</button>
									</div>
									<div className="p-6">
										<SyntaxHighlighter
											language={
												codeTab === "javascript" ? language : reactLanguage
											}
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
											{codeTab === "javascript" ? code : reactCode}
										</SyntaxHighlighter>
									</div>
								</>
							) : (
								<div className="p-6">
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
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
