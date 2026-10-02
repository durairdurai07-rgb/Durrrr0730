import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// In dev, /api is proxied to the FastAPI server so no CORS setup is needed.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { port: 5173, proxy: { "/api": "http://localhost:8000" } },
});
