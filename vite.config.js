import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build'
  },
  plugins: [vue(), svgLoader()],
  resolve: {
    extensions: ['.mjs', '.js', '.vue']
  }
})
