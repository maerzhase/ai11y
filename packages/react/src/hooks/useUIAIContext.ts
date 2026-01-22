import { useContext } from "react";
import { UIAIProviderContext } from "../components/UIAIProvider.js";

/**
 * Hook to access the UI AI context
 *
 * @example
 * ```tsx
 * const ctx = useUIAIContext()
 * const ui = ctx.describe()
 * ctx.act({ action: "click", id: "save_button" })
 * ```
 */
export function useUIAIContext() {
	const context = useContext(UIAIProviderContext);
	if (!context) {
		throw new Error("useUIAIContext must be used within UIAIProvider");
	}
	return context;
}
