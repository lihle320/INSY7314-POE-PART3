import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import https from 'https'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      //reads the SSL certificate files for HTTPS (Orlov, 2020)
      key: fs.readFileSync('./localhost-key.pem'),  
      cert: fs.readFileSync('./localhost.pem')      
    },
   proxy: {
  '/api': {
    target: 'https://localhost:5000',
    changeOrigin: true,
    secure: false,
    agent: new https.Agent({
      rejectUnauthorized: false  // This tells Vite to trust your self-signed certs
    })
  }
}
  }
})