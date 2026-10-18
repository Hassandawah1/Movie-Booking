import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const backendDirectory = fileURLToPath(new URL('../Backend', import.meta.url))
  const backendEnv = loadEnv(mode, backendDirectory, '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${backendEnv.PORT || 5000}`,
          changeOrigin: true
        }
      }
    }
  }
})
