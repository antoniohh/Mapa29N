# Plan de Arquitectura y Migración · Mapas Electorales de Extremadura

**Proyecto:** `mapas_elecciones_29N`  
**Destino:** CMS Méthode (HOY.es / Vocento)  
**Fecha:** 1 de noviembre de 2026  
**Autor:** Antonio Horrillo Horrillo / Antigravity  

---

## 1. Objetivos del Proyecto

1. **Empaquetado Único (Single Bundle):** Generar un único archivo JavaScript en formato IIFE (`dist/mapas-elecciones.js`) que contenga el motor cartográfico (MapLibre GL JS), la lógica de renderizado y los estilos visuales integrados en el `<head>`, sin requerir links CSS externos.
2. **Desacoplamiento de Datos:** Servir los archivos GeoJSON y el estilo cartográfico base como recursos independientes desde una ruta pública (`/datos` en local, CDN / jsDelivr con tags de Git en producción), evitando bundles pesados e innecesarios.
3. **Aislamiento Multinstancia (Méthode):** Eliminar selectores e IDs estáticos en el DOM (`#voc-map`, `#voc-map-search-input`) para garantizar que puedan coexistir varios mapas en un mismo artículo o página sin conflictos de eventos.
4. **Integración Declarativa:** Permitir que los periodistas o editores de Méthode incrusten cualquier mapa en un artículo simplemente insertando un `<div>` con atributos semánticos `data-mapa` y `data-data-url`.

---

## 2. Arquitectura de Módulos

```text
src/
├── constants/
│   ├── municipios.js         # Mapeo de 388 códigos INE de Extremadura (06xxx y 10xxx)
│   └── colores.js            # Paleta oficial y normalizador de partidos
├── utils/
│   ├── formatters.js         # Funciones puras de formateo (porcentajes, diffs, nombres)
│   └── controls.js           # Inicialización del DOM interno, buscador OSM y botón reset
├── styles/
│   └── mapa.css              # Hoja de estilos unificada (MapLibre + Tooltips Vocento)
├── mapas/
│   ├── mapa_diferencia.js    # Mapa 1: Mayor subida de votos por sección censal
│   ├── mapa_autonomicas.js   # Mapa 2: Ganador de autonómicas + participación
│   └── mapa_generales.js     # Mapa 3: Resultados electorales de generales
└── main.js                   # Inyección de estilos y auto-inicializador data-*
```

---

## 3. Especificación de los Mapas

### 3.1. Mapa de Diferencia de Votos (`data-mapa="diferencia"`)
* **Archivo de datos:** `diferencia_votos_extremadura_limpio.geojson` (1.523 features).
* **Lógica coroplética:** Compara los campos de diferencia de voto (`vox_dif`, `pp_dif`, `podemos_dif`, `psoe_dif`) y colorea el polígono con el color del partido que experimentó el **mayor incremento porcentual positivo**. Si ninguno sube o no hay datos, se colorea en gris neutro (`#A0A0A0`).
* **Tooltip hover:** Muestra el municipio y sección, seguido de la lista ordenada de partidos con barras relativas (máximo 25%) y texto en verde para subidas (`+X,XX%`) o rojo para caídas (`-X,XX%`).

### 3.2. Mapa de Elecciones Autonómicas (`data-mapa="autonomicas"`)
* **Archivo de datos:** `resultados-censo-21d.geojson` (1.523 features).
* **Lógica coroplética:** Asigna a cada sección el color del **partido ganador** (`primero` / `p1` / `ganador`).
* **Tooltip hover:** Muestra el municipio, distrito/sección, métrica destacada de **Participación (%)** y ranking de los 4 primeros partidos con barras proporcionales.

### 3.3. Mapa de Elecciones Generales (`data-mapa="generales"`)
* **Archivo de datos:** `secciones_extremadura_votos.geojson` (966 features).
* **Lógica coroplética:** Pinta según el partido con mayor número de votos (`partido_ganador`).
* **Tooltip hover:** Desglose de los 4 partidos principales clasificados por porcentaje sobre el total de candidaturas.

---

## 4. Controles y Herramientas Integradas

1. **Buscador Geográfico:**
   * Conectado a la API de geocodificación de OpenStreetMap Nominatim (`https://nominatim.openstreetmap.org/search?format=json&countrycodes=es&q=...`).
   * Al pulsar *Buscar* o presionar *Enter*, realiza una animación de vuelo (`map.flyTo({ zoom: 14 })`) al punto localizado.
2. **Botón de Reinicio (Reset View):**
   * Control nativo de MapLibre ubicado en la esquina inferior derecha.
   * Calcula dinámicamente los límites geográficos (`bounds`) del GeoJSON cargado y reencuadra la vista al hacer clic.
3. **Diccionario de Toponimia:**
   * Corrige orden sintáctico: *"Albuera, La"* ➔ *"La Albuera"*, *"Santos de Maimona, Los"* ➔ *"Los Santos de Maimona"*.
   * Capitalización correcta de artículos y preposiciones.

---

## 5. Estrategia de Despliegue en Méthode

1. **Compilación:**
   ```bash
   npm run build
   ```
   Genera el archivo `dist/mapas-elecciones.js`.
2. **Publicación:**
   Subir el código a GitHub y generar un release con **Tag de Git** (ej: `@v1.0.0`) para evitar problemas de caché en el CDN de jsDelivr.
3. **Inserción en Méthode (Módulo Código):**
   ```html
   <script defer src="https://cdn.jsdelivr.net/gh/tu-organizacion/mapas_elecciones_29N@v1.0.0/dist/mapas-elecciones.js"></script>

   <div id="mapa-elecciones-extremadura"
        data-mapa="autonomicas"
        data-data-url="https://cdn.jsdelivr.net/gh/tu-organizacion/mapas_elecciones_29N@v1.0.0/public/datos/">
   </div>
   ```
