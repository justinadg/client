import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "RAS Autocare",
        short_name: "RasReserve",
        description: "Car servicing management system for businesses",
        theme_color: "#AF8447",
        background_color: "#f7f7f7",
        scope: "/",
        start_url: "/",
        display: "standalone",
        screenshots: [
          {
            src: "/screenshots/screenshot1.jpg",
            sizes: "1921x884",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "/screenshots/screenshot2.png",
            sizes: "432x935",
            type: "image/png",
            form_factor: "narrow",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        importScripts: ["/service-worker/push.js"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@mui/styled-engine": "@mui/styled-engine-sc",
    },
  },
});
