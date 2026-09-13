import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// The site's public URL, baked into index.html's link-preview tags (og:image must
// be absolute). Defaults to the Render URL; set VITE_PUBLIC_URL on the host when
// the app moves to a custom domain.
const PUBLIC_URL = (process.env.VITE_PUBLIC_URL || 'https://aussieblock-app.onrender.com').replace(/\/+$/, '')
const publicUrlPlugin = {
  name: 'public-url',
  transformIndexHtml: (html) => html.replaceAll('%PUBLIC_URL%', PUBLIC_URL),
}

export default defineConfig({
  plugins: [react(), publicUrlPlugin],
  server: {
    // Anything the app requests at /api/... is forwarded to the backend
    // (FastAPI on port 8000). The "/api" prefix is stripped before forwarding,
    // so the app calling /api/orders actually hits http://127.0.0.1:8000/orders.
    // This keeps the backend address in ONE place and avoids browser CORS issues.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
