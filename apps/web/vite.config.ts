import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      'react': path.resolve(root, 'node_modules/react'),
      'react-dom': path.resolve(root, 'node_modules/react-dom'),
      'react-router-dom': path.resolve(root, 'node_modules/react-router-dom'),
    },
  },
  server: {
    fs: {
      allow: [root],
    },
  },
})
