import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        resume: resolve(import.meta.dirname, 'resume.html'),
        globe: resolve(import.meta.dirname, 'globe.html'),
        swiss: resolve(import.meta.dirname, 'swiss.html'),
        poster: resolve(import.meta.dirname, 'poster.html'),
        ghost: resolve(import.meta.dirname, 'ghost.html'),
        collage: resolve(import.meta.dirname, 'collage.html'),
        home: resolve(import.meta.dirname, 'home.html'),
        quiet: resolve(import.meta.dirname, 'quiet.html'),
      },
    },
  },
});
