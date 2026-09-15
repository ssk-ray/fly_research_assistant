import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Vite blocks requests with unrecognized Host headers by default
      // (a security guard against DNS-rebinding attacks). ngrok's tunnel
      // domain isn't localhost, so it gets rejected unless explicitly
      // allowed here.
      allowedHosts: ['ardently-subduing-discover.ngrok-free.dev'],
      // Forward anything under /api to the FastAPI backend running on
      // port 8000. This means the browser only ever talks to ONE origin
      // (wherever this Vite server is exposed, e.g. via ngrok), and Vite
      // relays backend calls to localhost:8000 behind the scenes.
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});