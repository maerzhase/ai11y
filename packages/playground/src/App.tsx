import React, { useEffect, useState } from "react";
import { questManager, type ScrollState } from "react-quest";

export default function App() {
	const [scroll, setScroll] = useState<ScrollState | null>(null);

	useEffect(() => {
		const rootId = questManager.addRoot(window, "window");

		const unsub = questManager.subscribe(rootId, (state) => {
			setScroll(state);
		});

		return () => {
			unsub();
			questManager.removeRoot(rootId);
		};
	}, []);

	return (
		<div style={{ minHeight: "300vh", padding: "2rem" }}>
			<h1>React Quest Playground</h1>
			<p>Scroll the page and watch the questManager output update.</p>

			<pre style={{ background: "#111", color: "#0f0", padding: "1rem" }}>
				{scroll
					? JSON.stringify(scroll, null, 2)
					: "Waiting for scroll state..."}
			</pre>
		</div>
	);
}
