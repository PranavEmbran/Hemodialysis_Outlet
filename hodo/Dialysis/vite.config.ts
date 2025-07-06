import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteMockServe } from 'vite-plugin-mock'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteMockServe({
      mockPath: 'src/mock',
      enable: true,
      supportTs: true,
      logger: true,
    })
  ],
  server: {
    host: true,
    // port:3066,
    port: 3000
  }
})


