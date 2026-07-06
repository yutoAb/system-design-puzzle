import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "client",
  // VITE_ 付き環境変数をリポジトリルートの .env から読む（サーバーと共用）
  envDir: "..",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4173"
    }
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true
  }
});
