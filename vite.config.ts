import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isGitHubPages = mode === "github";
  return {
    plugins: [react()],
    base: isGitHubPages ? "/sundae-pricing/" : "/",
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return;
            }

            if (id.includes('jspdf')) {
              return 'jspdf';
            }

            if (id.includes('html2canvas')) {
              return 'html2canvas';
            }

            if (id.includes('recharts')) {
              return 'charts';
            }

            if (id.includes('framer-motion')) {
              return 'motion';
            }

            if (id.includes('lucide-react')) {
              return 'icons';
            }

            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router-dom/')
            ) {
              return 'react-vendor';
            }
          },
        },
      },
    },
    server: {
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      },
    },
  };
});
