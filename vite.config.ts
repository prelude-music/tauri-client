import { defineConfig } from "vite";

export default defineConfig(async () => ({
	// dev server settings
	clearScreen: false,
	server: {
		port: 1420,
		strictPort: true,
		watch: {
			ignored: ["**/src-tauri/**"],
		},
	},
 
	// build settings
	mode: "production",
	assetsInclude: "**/*.md",
	build: {
		rollupOptions: {
			output: {
				assetFileNames: "assets/[name].[ext]",
				entryFileNames: "assets/[name].js",
				chunkFileNames: "assets/[name].js",
			},
		},
	},
}));
