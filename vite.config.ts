import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "FlowCube Portal",
          short_name: "FlowCube",
          description: "Cyberpunk Focus & Planetary Repair",
          theme_color: "#050505",
          background_color: "#050505",
          display: "standalone",
          icons: [
            {
              src: "https://picsum.photos/seed/flowcube/192/192",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "https://picsum.photos/seed/flowcube/512/512",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
