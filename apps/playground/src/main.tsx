import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

// biome-ignore lint: must
const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
