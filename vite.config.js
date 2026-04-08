import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5172,
    allowedHosts: ["sidereal-unwhimsically-hai.ngrok-free.dev"],
    proxy: {
      "/upc-lookup": {
        target: "https://scanbot.io",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/upc-lookup/, "/wp-json/upc/v1/lookup"),
      },
    },
  },
});
