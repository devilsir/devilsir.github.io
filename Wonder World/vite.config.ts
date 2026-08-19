import { defineConfig } from "vite";

export default defineConfig({
  // Caminhos relativos funcionam tanto no domínio principal quanto em /nome-do-repositorio/.
  base: "./",
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  },
  build: {
    target: "es2022",
    sourcemap: false,
    chunkSizeWarningLimit: 1400
  }
});
