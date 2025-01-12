import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import devTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  base: '',
  build: {
    outDir: 'build',
    sourcemap: mode == 'development' ? 'inline' : false
  },
  plugins: [vue(), svgLoader(), devTools()],
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
}))
