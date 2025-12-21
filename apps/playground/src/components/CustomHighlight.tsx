import type React from "react";

interface CustomHighlightWrapperProps {
	markerId: string;
	children: React.ReactNode;
}

/**
 * Custom highlight wrapper component that uses Tailwind CSS classes
 * This demonstrates the new component-based highlighting approach
 */
export function CustomHighlightWrapper({
	markerId,
	children,
}: CustomHighlightWrapperProps) {
	return (
		<div
			className="ring-4 ring-blue-500 dark:ring-blue-400 ring-opacity-75 shadow-[0_0_20px_rgba(59,130,246,0.6)] dark:shadow-[0_0_20px_rgba(96,165,250,0.6)] transition-all duration-500 ease-in-out z-50 relative animate-pulse"
			style={{
				borderRadius: "inherit",
			}}
		>
			{children}
		</div>
	);
}
