import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Project page on GitHub Pages is served from a subpath
// (e.g. csiiiv.github.io/ocds_mapping_explorer/). CI sets VITE_BASE to that
// subpath; local dev stays at "/".
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
    allowedHosts: ["ocds.simple-systems.dev", ".simple-systems.dev"],
  },
});
