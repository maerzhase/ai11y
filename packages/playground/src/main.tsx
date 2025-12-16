import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StoryExample } from "./StoryExample";

// biome-ignore lint: must
const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<StoryExample />
	</React.StrictMode>,
);
