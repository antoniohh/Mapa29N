# Análisis Técnico: MapLibre GL vs. Leaflet en Cartografía Digital

**Documento técnico y comparativo para proyectos editoriales y periodismo de datos.**  
**Proyecto:** Mapas Electorales Extremadura (29N) · CMS Méthode / HOY.es (Grupo Vocento)  
**Fecha:** Noviembre de 2026

---

## 1. Resumen Ejecutivo

Históricamente, **Leaflet** ha sido la librería JavaScript de referencia para integrar mapas interactivos basados en OpenStreetMap en la web. Sin embargo, para proyectos editoriales modernos que manejan análisis masivo de datos (como escrutinios electorales por secciones censales con miles de geometrías vectoriales), la industria del periodismo de datos ha migrado hacia tecnologías basadas en **aceleración por hardware (WebGL)**, encabezadas actualmente por **MapLibre GL JS**.

Este documento detalla el origen de MapLibre GL, sus diferencias fundamentales frente a Leaflet y la justificación técnica de su adopción en este proyecto.

---

## 2. Origen Histórico de MapLibre GL

1. **La era de Mapbox GL JS (2014 - 2020):**
   * Mapbox revolucionó los mapas en la web al introducir el renderizado de **teselas vectoriales (*Vector Tiles*)** procesadas directamente en la GPU del usuario mediante WebGL.
   * Hasta la versión v1.13, Mapbox GL JS era código abierto bajo licencia permisiva BSD 3-Clause.

2. **El cambio de licencia (Diciembre 2020):**
   * A finales de 2020, Mapbox cerró el código a partir de la versión v2.0, adoptando una licencia privativa de pago obligatoria por carga de mapa o usuario.

3. **Nacimiento de MapLibre GL:**
   * La comunidad de código abierto, con el respaldo de organizaciones y empresas como la **OpenStreetMap Foundation, Amazon (AWS Location Service), Meta, Microsoft y Elastic**, creó una bifurcación (*fork*) comunitaria desde la última versión libre.
   * Ese proyecto es **MapLibre GL JS**, hoy en día el estándar libre, gratuito, independiente y de código abierto para mapas vectoriales acelerados por GPU.

---

## 3. Comparativa Técnica Detallada

| Criterio | Leaflet (Enfoque Tradicional) | MapLibre GL JS (Enfoque Moderno) |
| :--- | :--- | :--- |
| **Motor de Renderizado** | **CPU / DOM / SVG / Canvas 2D**<br>Cada elemento o polígono se inyecta como un nodo SVG en el árbol del DOM o se dibuja en un canvas 2D básico. | **GPU / WebGL & WebGL2**<br>Las geometrías se envían a la memoria de la tarjeta gráfica y se dibujan mediante *shaders* a 60 fotogramas por segundo (fps). |
| **Tipo de Mapa Base** | **Teselas Raster (PNG / JPG / WebP)**<br>Imágenes estáticas pre-renderizadas de 256×256 px servidas desde un servidor de teselas. | **Teselas Vectoriales (*MapLibre Style Spec*)**<br>Puntos, líneas y polígonos matemáticos crudos que el cliente dibuja en tiempo real según una hoja de estilos JSON. |
| **Consumo de Memoria con Datos Masivos** | **Alto en CPU y DOM**<br>Con más de 500-1.000 polígonos censales complejos, el navegador sufre caídas de frames, latencia en hover y alto consumo de RAM en el hilo principal. | **Muy eficiente en GPU**<br>Capaz de mover decenas de miles de polígonos y vértices en hilos separados (Web Workers) sin bloquear la interfaz. |
| **Experiencia de Navegación** | Zoom en escalones fijos discretos (niveles enteros 1, 2, 3...) y vista cenital estrictamente plana. | **Zoom continuo suave (*fractional zoom*)**, rotación libre del mapa (norte configurable) y perspectiva inclinada (3D pitch). |
| **Estilos y Personalización** | Difícil de alterar los colores del mapa base (requiere filtros CSS sobre imágenes o servidores de teselas propios). | **Estilos dinámicos por JSON**<br>Permite cambiar el color de carreteras, ríos, fondos o idioma de las etiquetas al vuelo. |
| **Resolución en Pantallas de Alta Densidad** | Las imágenes raster pueden verse borrosas o pixeladas en pantallas Retina / 4K / móviles de alta gama a menos que se carguen al doble de resolución (@2x). | **Nitidez vectorial absoluta**<br>Las etiquetas tipográficas y líneas se rasterizan localmente a la resolución nativa de cada pantalla. |

---

## 4. Justificación Técnica en el Proyecto Electoral de Extremadura (29N)

En este desarrollo, la elección de MapLibre GL JS frente a Leaflet responde a tres necesidades críticas:

### A. Carga Concurrente de más de 4.500 Polígonos Censales
* El panel de validación muestra **tres mapas simultáneamente**:
  1. *Mayor aumento de votos (2019 vs 2023)*
  2. *Elecciones Autonómicas*
  3. *Elecciones Generales*
* Extremadura cuenta con **1.523 secciones censales**. Tener los 3 mapas abiertos a la vez implica procesar y dibujar **4.569 polígonos poligonales de alta resolución**.
* En Leaflet, gestionar 4.569 nodos SVG simultáneos en el DOM provocaría tirones evidentes al mover el ratón o hacer zoom. En MapLibre GL, el Web Worker pre-calcula los *buffers* en segundo plano y la GPU los dibuja sin penalizar el hilo principal de la página.

### B. Compatibilidad con el Estilo Editorial Corporativo (`base_DW_gray.json`)
* El diario *HOY* y el grupo *Vocento* emplean una cartografía base sobria y minimalista en escala de grises suministrada por **Datawrapper**.
* Este estilo base no es una imagen, sino un archivo JSON vectorial (`https://static.hoy.es/comun/html/base_DW_gray.json`) diseñado específicamente bajo la especificación de MapLibre. Leaflet no puede interpretar este formato de forma nativa sin complejas capas intermedias.

### C. Empaquetado Autónomo para CMS Méthode
* La integración en Méthode requería un único archivo JavaScript (`dist/mapas-elecciones.js`) que pudiese insertarse en cualquier noticia sin dependencias externas de librerías en el `<head>`.
* Mediante el uso del **Web Worker inlined en Blob** implementado en la release v1.1.0, el motor cartográfico viaja completo, encapsulado y listo para funcionar en cualquier entorno editorial.

---

## 5. Criterios de Selección: ¿Cuándo usar cada librería?

### Utilizar Leaflet si:
* El proyecto consiste en un mapa sencillo con pocos elementos (ej. localizar una sede, 10-50 chinchetas o rutas básicas de senderismo).
* El peso inicial de la librería es un factor crítico absoluto (~40 KB de Leaflet frente a ~300-450 KB comprimidos de un motor WebGL).
* El equipo de desarrollo no necesita personalizar los colores del mapa base ni manejar zoom continuo.
* Se requiere compatibilidad con navegadores muy antiguos que carezcan de soporte WebGL.

### Utilizar MapLibre GL si:
* Se visualizan **datos electorales, censales, parcelarios o catastrales densos** (coropletas por municipios o secciones).
* Se requiere aplicar estilos vectoriales de diseño editorial o corporativo (Datawrapper, MapTiler, etc.).
* Se busca una experiencia de usuario interactiva fluida (tooltips instantáneos al vuelo, búsqueda en tiempo real, transiciones suaves).
* Se desarrollan aplicaciones cartográficas de periodismo de investigación o dashboards de inteligencia territorial.
