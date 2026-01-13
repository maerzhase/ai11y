import React from "react";
import { DebugPanel } from "../components/Shared/DebugPanel";
import { DebugDrawerProvider, useDebugDrawer } from "../context/DebugDrawerContext";

interface AppLayoutProps {
	children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
	const { isOpen, setIsOpen } = useDebugDrawer();

	return (
		<div className="min-h-screen bg-background text-foreground transition-colors overflow-x-hidden">
			<DebugPanel isOpen={isOpen} onOpenChange={setIsOpen} />
			<div
				className={`min-h-screen transition-all duration-300 ease-in-out ${
					isOpen
						? "mr-96 w-[calc(100%-24rem)]"
						: "mr-0 w-full"
				}`}
			>
				{children}
			</div>
		</div>
	);
}

export function AppLayout({ children }: AppLayoutProps) {
	return (
		<DebugDrawerProvider>
			<AppLayoutContent>{children}</AppLayoutContent>
		</DebugDrawerProvider>
	);
}
