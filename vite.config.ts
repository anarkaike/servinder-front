import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@boot': fileURLToPath(new URL('./src/boot', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@database': fileURLToPath(new URL('./src/database', import.meta.url)),
      '@models': fileURLToPath(new URL('./src/database/models', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/database/utils', import.meta.url)),
      '@migrations': fileURLToPath(new URL('./src/database/migrations', import.meta.url)),
    }
  },
  server: {
    port: 9000
  }
});
