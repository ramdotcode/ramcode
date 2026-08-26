import { resolve } from 'path'
import { defineConfig } from 'vite'

// Multi-page: semua halaman HTML harus didaftarkan di sini
// supaya ikut ke hasil build. Halaman baru = tambah 1 baris.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        layanan: resolve(__dirname, 'layanan.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        faq: resolve(__dirname, 'faq.html'),
        proyek: resolve(__dirname, 'proyek.html'),
      },
    },
  },
})
