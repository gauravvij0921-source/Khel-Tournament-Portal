import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
// Universal base './' works on both GitHub Pages (/Khel-Tournament-Portal/) and Cloud Run root (/)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
});
