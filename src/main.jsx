import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Lock zoom on touch devices. The viewport meta (user-scalable=no) is ignored by
// Safari in a browser tab, so back it up: swallow iOS pinch gestures and any
// multi-finger touchmove, except inside a map or a drawing canvas (the signature
// pad), which handle their own touches. Two-finger page zoom is the only thing
// this removes — scrolling, tapping and typing are untouched.
const ownsTouches = (t) => !!(t && t.closest && t.closest('.gm-style, canvas, [data-own-touch]'))
for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(ev, (e) => { if (!ownsTouches(e.target)) e.preventDefault() }, { passive: false })
}
document.addEventListener('touchmove', (e) => {
  if ((e.touches.length > 1 || (e.scale !== undefined && e.scale !== 1)) && !ownsTouches(e.target)) e.preventDefault()
}, { passive: false })
// Register the service worker so the app is installable (installed PWAs are
// allowed to play the new-order alarm without a click after launch).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
