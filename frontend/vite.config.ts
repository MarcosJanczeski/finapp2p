import { defineConfig } from 'vite'
import path from 'node:path'

// Vite config com aliases para facilitar importações no frontend e reuse de módulos em shared.
export default defineConfig({
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  server: {
    host: true
  },
  preview: {
    host: true
  }
})
