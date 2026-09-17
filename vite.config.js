import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Railway inyecta PORT y exige escuchar en 0.0.0.0.
const port = Number(process.env.PORT) || 4173

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port,
    // Railway sirve tras su propio dominio; sin esto vite preview rechaza el Host.
    allowedHosts: true,
  },
  server: { host: true },
})
