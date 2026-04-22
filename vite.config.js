import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    /* three.js minified is often just over 500 kB; split vendors + allow headroom. */
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('three')) return 'vendor-three';
          if (id.includes('ogl')) return 'vendor-ogl';
          if (id.includes('gsap')) return 'vendor-gsap';
          if (id.includes('lenis')) return 'vendor-lenis';
        },
      },
    },
  },
});
