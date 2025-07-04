import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },
  server: {
    port: 8080,
    host: true, // Allow external connections
    open: true, // Automatically open browser
    hmr: {
      overlay: true, // Show HMR errors as overlay
    },
    watch: {
      // Fine-tune file-watching: only ignore node_modules and build output; watch the rest
      ignored: ["**/node_modules/**", "**/dist/**"],
    },
  },
  // Enable HMR for better development experience
  optimizeDeps: {
    include: ["phaser"],
  },
  // Configure file watching
  define: {
    __DEV__: true,
  },
});
