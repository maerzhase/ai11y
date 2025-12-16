import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		{
			name: "fix-node-modules",
			generateBundle() {
				// This plugin helps prevent Node.js module errors
			},
			transform(code, id) {
				// Replace Node.js module imports with empty stubs
				if (code.includes("node:module")) {
					return code.replace(
						/import\s+.*\s+from\s+["']node:module["']/g,
						"// node:module removed for browser compatibility",
					);
				}
				if (code.includes("createRequire")) {
					return code.replace(
						/var\s+__require\s*=\s*.*createRequire.*/g,
						"var __require = () => { throw new Error('createRequire not available in browser'); };",
					);
				}
			},
		},
	],
	optimizeDeps: {
		exclude: ["openai"],
	},
});
