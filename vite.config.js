import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/proof-of-concept/',
  server: {
    host: true,
    cors: true,
  },
  plugins: [react()],
})




