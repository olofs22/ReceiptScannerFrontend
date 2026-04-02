import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // https: {
    //   key: fs.readFileSync('localhost+192.168.1.185-key.pem'),
    //   cert: fs.readFileSync('localhost+192.168.1.185.pem'),
    // }
  }

})
