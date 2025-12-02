import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Express plugin only in dev mode
  const plugins = [react()];
  if (mode === 'development') {
    plugins.push(expressPlugin());
  }

  return {
    server: {
      host: "::",
      port: 8080,
      fs: {
        allow: [".", "./client", "./shared"],
        deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
      },
    },
    build: {
      outDir: "dist/spa",
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
  };
});

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      // Dynamically import to avoid bundling server code
      import("./server/index.js").then((module) => {
        const app = module.createServer();
        server.middlewares.use(app);
      }).catch((err) => {
        console.warn("Could not load server:", err.message);
      });
    },
  };
}
