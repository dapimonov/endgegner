import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const pagesRoot = fileURLToPath(new URL("./github-pages", import.meta.url));
const publicDir = fileURLToPath(new URL("./public", import.meta.url));
const outputDir = fileURLToPath(new URL("./pages-dist", import.meta.url));

export default defineConfig({
  base: "/endgegner/",
  root: pagesRoot,
  publicDir,
  plugins: [react()],
  build: {
    emptyOutDir: true,
    outDir: outputDir,
  },
});
