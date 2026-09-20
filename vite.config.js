import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite el acceso desde cualquier dispositivo en la red local (ej: 192.168.x.x:5173)
    port: 5173
  }
})