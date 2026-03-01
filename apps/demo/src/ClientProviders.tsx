"use client";

import "@mcp-b/global/iife";
import "@ai11y/core";

import { setRoute } from "@ai11y/core";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import React from "react";
import { CustomHighlightWrapper } from "@/components/Shared/CustomHighlight";
import { DemoUiProvider } from "@/context/DemoUiContext";
import { AppLayout } from "@/layout/AppLayout";

export function ClientProviders({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();

	const _handleNavigate = React.useCallback(
		(route: string) => {
			if (route !== pathname) {
				router.push(route, { scroll: false });
			}
		},
		[router, pathname],
	);

	React.useEffect(() => {
		setRoute(pathname ?? "/");
	}, [pathname]);

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<DemoUiProvider highlightWrapper={CustomHighlightWrapper}>
				<AppLayout>{children}</AppLayout>
			</DemoUiProvider>
		</ThemeProvider>
	);
}
