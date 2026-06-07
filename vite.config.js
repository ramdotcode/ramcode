import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    // Menghilangkan chaining dengan memaksa CSS tetap kecil dan mudah dioptimasi
    cssCodeSplit: false,
    assetsInlineLimit: 10000, // Inline assets < 10kb (termasuk font kecil jika ada)
  },
});
