import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      name: 'MapasElecciones',
      fileName: () => 'mapas-elecciones.js',
      formats: ['iife']
    },
    rollupOptions: {
      // Incluye maplibre-gl y sus dependencias dentro del bundle único final
      external: []
    }
  }
});
