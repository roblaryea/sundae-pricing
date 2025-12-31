import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isGitHubPages = mode === "github";
  return {
    plugins: [react()],
    base: isGitHubPages ? "/sundae-pricing/" : "/",
  };
});