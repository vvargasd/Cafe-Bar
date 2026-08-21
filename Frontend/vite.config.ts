import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages sirve este proyecto desde /Cafe-Bar/, no desde la raíz del dominio.
// El resto de los flujos (dev, LAN preview) siguen usando raíz sin tocar nada.
const base = process.env.GH_PAGES ? '/Cafe-Bar/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Café La Española',
        short_name: 'La Española',
        description: 'Sistema de punto de venta para Café La Española',
        lang: 'es',
        theme_color: '#3E2723',
        background_color: '#FAF8F5',
        display: 'standalone',
        // El layout 70/30 de PosScreen (CLAUDE.md) nunca se pensó para vertical:
        // esto bloquea la orientación a horizontal cuando la app corre instalada.
        orientation: 'landscape',
        // Relativo, no absoluto: así funciona tanto en raíz (LAN/preview) como bajo /Cafe-Bar/ (GitHub Pages)
        start_url: '.',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
