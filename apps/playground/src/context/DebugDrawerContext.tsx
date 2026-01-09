import React, { createContext, useContext, useState, useEffect } from "react";

interface DebugDrawerContextType {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}

const DebugDrawerContext = createContext<DebugDrawerContextType | undefined>(
	undefined,
);

export function DebugDrawerProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(() => {
		const stored = localStorage.getItem("debug-panel-open");
		return stored === "true";
	});

	// Persist open state
	useEffect(() => {
		localStorage.setItem("debug-panel-open", String(isOpen));
	}, [isOpen]);

	return (
		<DebugDrawerContext.Provider value={{ isOpen, setIsOpen }}>
			{children}
		</DebugDrawerContext.Provider>
	);
}

export function useDebugDrawer() {
	const context = useContext(DebugDrawerContext);
	if (context === undefined) {
		throw new Error(
			"useDebugDrawer must be used within a DebugDrawerProvider",
		);
	}
	return context;
}
