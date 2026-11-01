# Registro de Sesión · 1 de Noviembre de 2026

**Objetivo:** Análisis de tres mapas electorales de Extremadura y migración a un proyecto Node + Vite con exportación de bundle único para CMS Méthode.  
**Participantes:** Antonio Horrillo Horrillo, Antigravity.

---

## 1. Estado Inicial

En el directorio `/home/antoniohh/Proyectos/mapas_elecciones_29N` se disponía originalmente de tres archivos HTML monolíticos:
* `mapa-diferencia-votos-extremadura.html`
* `mapa-elecciones-autonomicas-ex.html`
* `mapa-generales.html`

### Puntos débiles detectados en los HTML originales:
1. **Carga por CDN externo no gestionado:** Dependencia directa de `unpkg.com/maplibre-gl@3.6.1`.
2. **Colisión de IDs en el DOM:** Empleo de identificadores fijos en el documento (`#voc-map`, `#voc-map-search-input`, `#voc-map-search-btn`), lo que impedía insertar más de un mapa en una misma página de Méthode.
3. **Código duplicado:** El diccionario de municipios INE de Extremadura (388 entradas) y las funciones auxiliares de cálculo estaban repetidas en los tres archivos (~900 líneas duplicadas).
4. **GeoJSON remotos en repositorios personales:** Se cargaban desde `raw.githubusercontent.com/maria-diaz-hoy/Mapas/main/`.

---

## 2. Análisis del Proyecto de Referencia

Se analizó el proyecto hermano `widgets-carburantes-extremadura` ubicado en la carpeta superior, extrayendo las mejores prácticas para integración en Méthode:
* Configuración de Vite con salida de librería en formato **IIFE** (`formats: ['iife']`).
* Inyección de estilos CSS inline mediante `?inline` desde `src/main.js` hacia `<head>`.
* Autodetección declarativa de componentes mediante atributos HTML `data-*` (`[data-mapa]`, `[data-data-url]`).
* Servir los datos JSON/GeoJSON desacoplados desde la carpeta `public/` para permitir que el script final sea ligero y los datos se actualicen sin recompilar.

---

## 3. Acciones Realizadas Durante la Sesión

### A. Descarga y saneamiento de datos en `public/`
Se crearon las carpetas `public/datos` y `public/estilos` y se descargaron los recursos oficiales:
1. `public/datos/diferencia_votos_extremadura_limpio.geojson` (8,2 MB)
2. `public/datos/resultados-censo-21d.geojson` (6,4 MB)
3. `public/datos/secciones_extremadura_votos.geojson` (5,7 MB)
4. `public/estilos/base_DW_gray.json` (40 KB)

> **Incidencia crítica resuelta:** Durante la validación con Python se detectó que el archivo `diferencia_votos_extremadura_limpio.geojson` tenía una cabecera con **Byte Order Mark (BOM UTF-8: `\xef\xbb\xbf`)**, lo que generaba errores de sintaxis JSON en entornos estrictos. Se ejecutó un script de saneamiento para convertirlo a UTF-8 puro sin BOM.

### B. Inicialización del entorno Node.js
* Creación de `package.json` con Vite 6 y MapLibre GL 6 (`maplibre-gl@^6.16.0`).
* Se auditó la instalación resultando en **0 vulnerabilidades**.

### C. Modularización del código fuente en `src/`
* **`src/constants/municipios.js`:** Extracción de los 388 municipios de Badajoz y Cáceres a un módulo reutilizable.
* **`src/constants/colores.js`:** Paleta cromática oficial de partidos políticos (PP, PSOE, Vox, Podemos, UxEx, Sumar, Cs, etc.) y función de normalización de siglas.
* **`src/utils/formatters.js`:** Funciones de parseo de porcentajes, diferenciales con signo `+/-`, toponimia corregida y resolución de distrito/sección.
* **`src/utils/controls.js`:** Creación dinámica del DOM interno (buscador Nominatim + botón flotante de reset de vista), garantizando aislamiento multinstancia sin IDs globales.
* **`src/styles/mapa.css`:** CSS de MapLibre GL unificado con las tarjetas, tooltips editoriales y barras de porcentaje de Vocento/HOY.
* **`src/mapas/`**:
  * `mapa_diferencia.js`: Cálculo de mayor incremento relativo por sección.
  * `mapa_autonomicas.js`: Mapeo de ganador autonómico y porcentaje de participación.
  * `mapa_generales.js`: Visualización de resultados de elecciones generales.
* **`src/main.js`:** Punto de entrada del bundle, inyección del estilo en `<head>`, escaneo de elementos `[data-mapa]` y exportación a `window.MapasElecciones`.

### D. Configuración de Vite y Compilación
* Creación de `vite.config.js` en formato IIFE con nombre global `MapasElecciones`.
* Ajuste de importaciones ESM para `maplibre-gl` (`import { Map, NavigationControl, Popup, LngLatBounds } from 'maplibre-gl'`).
* **Verificación de build:** Compilación exitosa en `dist/mapas-elecciones.js` (1.181 kB sin comprimir / 315 kB gzip).

### E. Entorno de pruebas y documentación
* **`index.html`:** Página de desarrollo con pestañas interactivas para probar y validar los tres mapas con recarga en caliente de Vite.
* **`README.md`:** Guía detallada de instalación, atributos data y código listo para copiar y pegar en Méthode.
* **`.gitignore`:** Protección de `node_modules`, archivos de sistema y temporales.

---

## 4. Estado Final del Proyecto

El proyecto se encuentra **100% operativo, modularizado y compilado**. Los tres mapas cargan sus datos desde `public/datos/`, funcionan sin interferencias mutuas y están listos tanto para el flujo de desarrollo local (`npm run dev`) como para su despliegue y distribución en Méthode (`npm run build`).
