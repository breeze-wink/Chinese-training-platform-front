import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import compression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      vue(),
      compression()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // 你的 Spring Boot 服务器地址
        changeOrigin: true, // 是否修改请求头中的来源
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 800,
    sourcemap: true, // 或者 'inline' 或 'hidden'
  },
  optimizeDeps: {
    include: ['element-plus'],
  },
});