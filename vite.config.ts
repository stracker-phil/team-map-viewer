import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Update base to match your repo name when deploying to GitHub Pages.
// e.g. base: '/team-map-viewer/'
export default defineConfig({
  plugins: [react()],
  base: '/team-map-viewer/',
})
