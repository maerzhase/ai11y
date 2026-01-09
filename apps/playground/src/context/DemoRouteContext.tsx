import { createContext, useContext, useState, type ReactNode } from "react";

interface DemoRouteContextType {
	demoRoute: string;
	setDemoRoute: (route: string) => void;
}

const DemoRouteContext = createContext<DemoRouteContextType | null>(null);

export function DemoRouteProvider({ children }: { children: ReactNode }) {
	const [demoRoute, setDemoRoute] = useState("/");

	return (
		<DemoRouteContext.Provider value={{ demoRoute, setDemoRoute }}>
			{children}
		</DemoRouteContext.Provider>
	);
}

export function useDemoRoute() {
	const context = useContext(DemoRouteContext);
	if (!context) {
		throw new Error("useDemoRoute must be used within a DemoRouteProvider");
	}
	return context;
}
