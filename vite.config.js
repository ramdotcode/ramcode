import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Memastikan CSS di-bundle jadi satu untuk performa optimal
    cssCodeSplit: false,
    assetsInlineLimit: 10000, // Inline assets < 10kb
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
