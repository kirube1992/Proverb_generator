import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    server: {
    proxy: {
      // Any request starting with '/api' will be proxied
      '/api': {
        target: 'http://localhost:3000', // The address of your API server
        changeOrigin: true, // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api/, '') // Remove '/api' before sending to the target
      }
    }
  },
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
       VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Proverb of the Day',
        short_name: 'DailyProverb',
        description: 'A daily dose of wisdom from the book of Proverbs.',
        theme_color: '#b47f24',
        icons: [
          {
            src: '/icon.png', // You will need to create these icons
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
