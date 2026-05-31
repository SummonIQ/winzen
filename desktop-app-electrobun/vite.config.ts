import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, "renderer-src"),
  resolve: {
    alias: {
      "@heroicons/react": resolve(__dirname, "node_modules/@heroicons/react"),
      clsx: resolve(__dirname, "node_modules/clsx"),
      react: resolve(__dirname, "node_modules/react"),
      "react-dom": resolve(__dirname, "node_modules/react-dom"),
      "tailwind-merge": resolve(__dirname, "node_modules/tailwind-merge"),
      zustand: resolve(__dirname, "node_modules/zustand"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 30234,
    strictPort: true,
    fs: {
      allow: [
        resolve(__dirname),
        resolve(__dirname, "../app/renderer"),
      ],
    },
  },
  build: {
    outDir: resolve(__dirname, "renderer-dist"),
    emptyOutDir: true,
  },
});
