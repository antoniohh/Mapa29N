# Mapas Electorales Extremadura

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-396FEE?style=for-the-badge&logo=maplibre&logoColor=white)](#)
[![Version](https://img.shields.io/badge/Version-v1.2.0-blue?style=for-the-badge)](#)
[![Licencia Vocento](https://img.shields.io/badge/Licencia-Vocento-e53e3e?style=for-the-badge)](#)

Librería empaquetada de mapas interactivos electorales de Extremadura por secciones censales para su integración en el CMS **Méthode** (HOY.es / Grupo Vocento).

Diseñado para generar un único archivo JavaScript embebible (`dist/mapas-elecciones.js`) que contiene la lógica de renderizado, la librería cartográfica MapLibre GL JS y todos los estilos CSS necesarios sin requerir hojas de estilo externas.

---

## 📋 Control de Versiones (Changelog)

### [v1.2.0] - 2026-11-01 · *Release de Producción*
* **Inlining del Web Worker de MapLibre GL:** Solucionado de raíz el fallo de carga del Web Worker externo (`Worker failed to load`). El código del worker viaja 100% autocontenido en memoria mediante un `Blob URL` dentro de `dist/mapas-elecciones.js`, garantizando total autonomía en CMS Méthode sin peticiones adicionales.
* **Diseño vertical editorial en `index.html`:** Reestructuración del panel interactivo en una columna vertical centrada de 880px, emulando la maquetación final de lectura de los reportajes y noticias en *HOY.es*.
* **Documentación comparativa ampliada:** Incorporación del análisis técnico exhaustivo [docs/analisis_maplibre_gl_vs_leaflet.md](file:///home/antoniohh/Proyectos/Mapa29N/docs/analisis_maplibre_gl_vs_leaflet.md) justificando el uso de WebGL2 para renderizar más de 4.500 polígonos concurrentes.
* **Consolidación de CDN:** URLs de producción unificadas y apuntadas a la versión inmutable `@v1.2.0`.

### [v1.1.0] - 2026-11-01
* **Unificación de datos a GeoJSON estándar:** Eliminada la dependencia y referencias al archivo legado `datos_diferencia.js`. Los 3 mapas consumen ahora exclusivamente GeoJSON limpios desde el CDN propio.
* **Depuración del repositorio:** Eliminados los 3 archivos HTML monolíticos heredados (`mapa-*.html`), consolidando la arquitectura modular con Vite.
* **Mejora en resolución de rutas de datos:** Soporte robusto en `src/mapas/` para URLs absolutas de CDN, rutas relativas y terminaciones directas en `.geojson`.

### [v1.0.0] - 2026-11-01
* **Arquitectura modular inicial:** Migración y desacoplamiento de las tres visualizaciones electorales a módulos ES6 gestionados con Vite.
* **Compilación de bundle único:** Empaquetado IIFE (`dist/mapas-elecciones.js`) con estilos CSS inyectados automáticamente en el `<head>`.
* **Aislamiento DOM:** Renderizado multi-instancia libre de colisiones por IDs fijos en contenedores de Méthode.
* **Mapeo geográfico:** Integración de 388 códigos INE de municipios extremeños, geocodificador Nominatim OSM y botón de reset de límites.

---

## 🚀 Características

* **Bundle Único IIFE Autónomo:** Genera un único archivo JavaScript (`dist/mapas-elecciones.js`) con MapLibre GL, Web Worker inlined y estilos CSS inyectados automáticamente.
* **Sin colisiones de DOM:** Estructura modular multinstancia; no utiliza IDs fijos en los elementos internos, permitiendo múltiples mapas en la misma página.
* **Autodetección:** Los mapas se inicializan automáticamente mediante atributos HTML `data-mapa` y `data-data-url`.
* **Datos servidos desde CDN jsDelivr:** GeoJSON servidos de forma rápida, segura e inmutable con cabeceras CORS habilitadas.
* **Búsqueda geográfica:** Buscador integrado conectado a OpenStreetMap Nominatim y botón de reinicio de vista geográfica.
* **Tooltips editoriales:** Desglose interactivo con barras de proporción y colores oficiales de los partidos (PP, PSOE, Vox, Podemos, Sumar, etc.).

---

## 📁 Estructura del Proyecto

```text
Mapa29N/
├── dist/
│   ├── datos/                        # GeoJSON sincronizados listos para CDN
│   │   ├── diferencia_votos_extremadura_limpio.geojson
│   │   ├── resultados-censo-21d.geojson
│   │   └── secciones_extremadura_votos.geojson
│   ├── estilos/
│   │   └── base_DW_gray.json
│   └── mapas-elecciones.js           # Bundle único compilado para producción
├── docs/
│   ├── analisis_maplibre_gl_vs_leaflet.md  # Comparativa técnica Leaflet vs MapLibre
│   ├── plans/
│   │   └── plan_migracion_mapas_elecciones.md
│   ├── screenshots/
│   │   └── dashboard_3_mapas.png
│   └── sessions/
│       ├── 2026-11-01_sesion_analisis_migracion_vite.md
│       ├── 2026-11-01_sesion_release_v1_1_0_depuracion_dashboard.md
│       └── 2026-11-01_sesion_release_v1_2_0_produccion.md
├── public/
│   ├── datos/                        # Fuentes de datos GeoJSON locales
│   └── estilos/                      # Cartografía base local
├── src/
│   ├── constants/
│   │   ├── municipios.js             # Mapeo de 388 códigos INE de Extremadura
│   │   └── colores.js                # Paleta de colores y normalización de partidos
│   ├── utils/
│   │   ├── formatters.js             # Formateo de porcentajes, nombres y secciones
│   │   └── controls.js               # Buscador OSM y botón reset de límites
│   ├── styles/
│   │   └── mapa.css                  # CSS editorial + MapLibre CSS
│   ├── mapas/
│   │   ├── mapa_diferencia.js        # Mapa 1: Mayor subida de votos
│   │   ├── mapa_autonomicas.js       # Mapa 2: Elecciones autonómicas y participación
│   │   └── mapa_generales.js         # Mapa 3: Elecciones generales
│   └── main.js                       # Auto-inicializador, Web Worker inlined y estilos
├── index.html                        # Panel editorial vertical (simulación de noticia)
├── vite.config.js                    # Configuración de compilación Vite (modo lib IIFE)
└── package.json
```

---

## 🛠️ Instalación y Desarrollo

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo local:**
   ```bash
   npm run dev
   ```
   Abre `http://localhost:5173` en tu navegador para ver los tres mapas en columna vertical.

3. **Compilar el paquete para producción:**
   ```bash
   npm run build
   ```
   Actualiza el bundle en `dist/mapas-elecciones.js` y copia los recursos estáticos a `dist/`.

---

## 📰 Integración en CMS Méthode (Guía Oficial de Producción v1.2.0)

Para insertar cualquier mapa en un artículo o noticia mediante un **Módulo Código HTML**, se incluye el `<script>` y el contenedor `<div>` con los atributos `data-*`:

```html
<!-- Cargar el script empaquetado de producción v1.2.0 -->
<script defer src="https://cdn.jsdelivr.net/gh/antoniohh/Mapa29N@v1.2.0/dist/mapas-elecciones.js"></script>

<!-- Opción 1: Mapa de Diferencia de votos (Mayor subida 2019 vs 2023) -->
<div id="mapa-diferencia"
     data-mapa="diferencia"
     data-data-url="https://cdn.jsdelivr.net/gh/antoniohh/Mapa29N@v1.2.0/dist/datos">
</div>

<!-- Opción 2: Mapa de Elecciones Autonómicas (Ganador + Participación) -->
<div id="mapa-autonomicas"
     data-mapa="autonomicas"
     data-data-url="https://cdn.jsdelivr.net/gh/antoniohh/Mapa29N@v1.2.0/dist/datos">
</div>

<!-- Opción 3: Mapa de Elecciones Generales (Voto al Congreso) -->
<div id="mapa-generales"
     data-mapa="generales"
     data-data-url="https://cdn.jsdelivr.net/gh/antoniohh/Mapa29N@v1.2.0/dist/datos">
</div>
```

> [!TIP]
> Si deseas incluir más de un mapa en la misma noticia o página, solo necesitas cargar la etiqueta `<script>` una única vez. Cada mapa se renderizará de forma aislada en su respectivo `<div>`.

---

## ⚙️ Atributos Data Disponibles

| Atributo | Valores permitidos | Descripción |
| :--- | :--- | :--- |
| `data-mapa` | `diferencia` (por defecto), `autonomicas`, `generales` | Tipo de visualización a renderizar. |
| `data-data-url` | URL del CDN (ej. `.../dist/datos`) o ruta local | Directorio base o archivo directo donde se ubican los GeoJSON. |
| `data-style-url` | *(Opcional)* URL de estilo MapLibre | JSON de estilo cartográfico base (por defecto: `https://static.hoy.es/comun/html/base_DW_gray.json`). |

---

## 📄 Licencia y Términos de Uso

Este software ha sido desarrollado por y para el uso exclusivo de las cabeceras y servicios del grupo **Vocento**.

* **Propiedad:** © 2026 **Vocento** / **HOY.es**. Todos los derechos reservados.
* **Licencia:** Privativa (uso interno).
