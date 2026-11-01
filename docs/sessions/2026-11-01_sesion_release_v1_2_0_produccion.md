# Registro de Sesión · Release Oficial de Producción v1.2.0 · 1 de Noviembre de 2026

**Objetivo:** Consolidación y publicación de la release de producción v1.2.0: inlining del Web Worker de MapLibre GL en memoria, maquetación editorial en columna vertical y unificación definitiva de documentación y CDN.  
**Participantes:** Antonio Horrillo Horrillo, Antigravity.

---

## 1. Hitos Técnicos de la Release v1.2.0

### A. Solución Definitiva del Web Worker de MapLibre GL
* **Problema:** En MapLibre GL v6, el Web Worker no viene incrustado por defecto; se carga como un archivo `.mjs` independiente (`maplibre-gl-worker.mjs`). Al empaquetar la librería en un único bundle IIFE para CMS Méthode, el navegador no encontraba el archivo del worker y arrojaba `Error: Worker failed to load. Check that the worker URL is correct`.
* **Solución:**
  * Se importó el código fuente crudo del worker mediante `maplibre-gl/dist/maplibre-gl-worker.mjs?raw`.
  * Se inyecta dinámicamente en memoria al inicializar la aplicación con `new Blob([workerScript], { type: 'text/javascript' })` y `setWorkerUrl(URL.createObjectURL(blob))`.
  * Como salvaguarda ante entornos con Content Security Policy (CSP) muy restrictivas que prohíban blobs locales, se configuró un fallback a unpkg.
  * El bundle [`dist/mapas-elecciones.js`](file:///home/antoniohh/Proyectos/Mapa29N/dist/mapas-elecciones.js) ahora es **100% autocontenido y autónomo**.

### B. Maquetación Editorial Vertical en `index.html`
* A petición editorial, se abandonó la vista de 3 columnas para alinear el visor con la maquetación real de lectura de las noticias en *HOY.es*:
  * Contenedor central limitado a **880 px** (`max-width: 880px; margin: 0 auto;`).
  * Disposición vertical en columna (`display: flex; flex-direction: column; gap: 40px;`).
  * Altura de mapa optimizada a **600 px** en escritorio y **480 px** en móviles.
  * Leyendas independientes integradas al pie de cada tarjeta.

### C. Análisis Documental Leaflet vs MapLibre GL
* Se redactó y registró el documento técnico [docs/analisis_maplibre_gl_vs_leaflet.md](file:///home/antoniohh/Proyectos/Mapa29N/docs/analisis_maplibre_gl_vs_leaflet.md), detallando:
  * El origen histórico de MapLibre GL como fork comunitario de Mapbox tras su cambio de licencia en 2020.
  * Comparativa técnica entre renderizado CPU/DOM (Leaflet) y GPU/WebGL2 (MapLibre GL).
  * Justificación de rendimiento para mover más de 4.500 polígonos censales simultáneos a 60 fps y soporte del estilo vectorial `base_DW_gray.json` de Vocento/Datawrapper.

---

## 2. Guía Rápida de Uso en Méthode (v1.2.0)

```html
<!-- Script empaquetado v1.2.0 -->
<script defer src="https://cdn.jsdelivr.net/gh/antoniohh/Mapa29N@v1.2.0/dist/mapas-elecciones.js"></script>

<!-- Contenedor del mapa deseado -->
<div id="mapa-electoral"
     data-mapa="diferencia" <!-- o 'autonomicas' o 'generales' -->
     data-data-url="https://cdn.jsdelivr.net/gh/antoniohh/Mapa29N@v1.2.0/dist/datos">
</div>
```

---

## 3. Verificación de Calidad

* **Compilación de producción:** `npm run build` ejecutado con éxito (0 advertencias, 0 vulnerabilidades).
* **Navegador Chrome:** Verificación en modo headless sin errores de consola, WebGL o Web Worker.
* **Control de versiones:** Commit preparado para etiquetado manual `v1.2.0` en GitHub Desktop por el usuario.
