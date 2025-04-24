import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // Ensure all paths are relative
  build: {
    outDir: "dist/renderer",
    emptyOutDir: true,
    chunkSizeWarningLimit: 10000,
  },
});
