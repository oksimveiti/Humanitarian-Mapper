import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pin to 5173 so the dev origin always matches the backend CORS config.
  // strictPort makes Vite fail loudly if 5173 is taken instead of silently moving to 5174.
  server: { port: 5173, strictPort: true },
})
