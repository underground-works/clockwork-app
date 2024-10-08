import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  build: {
    outDir: 'build'
  },
  plugins: [vue(), svgLoader()],
  resolve: {
    extensions: ['.mjs', '.js', '.vue']
  },
  experimental: {
    renderBuiltUrl: filename => filename
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
})
