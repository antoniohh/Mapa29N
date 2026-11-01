# Mapas Electorales Extremadura

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-396FEE?style=for-the-badge&logo=maplibre&logoColor=white)](#)
[![Licencia Vocento](https://img.shields.io/badge/Licencia-Vocento-e53e3e?style=for-the-badge)](#)

Librería empaquetada de mapas interactivos electorales de Extremadura por secciones censales para su integración en el CMS **Méthode** (HOY.es / Grupo Vocento).

Diseñado para generar un único archivo JavaScript embebible (`dist/mapas-elecciones.js`) que contiene la lógica de renderizado, la librería cartográfica MapLibre GL JS y todos los estilos CSS necesarios sin requerir hojas de estilo externas.

---

## 🚀 Características

* **Bundle Único IIFE:** Genera un único archivo JavaScript (`dist/mapas-elecciones.js`) que inyecta automáticamente sus propios estilos en el `<head>`.
* **Sin colisiones de DOM:** Estructura modular multinstancia; no utiliza IDs fijos en los elementos internos, permitiendo múltiples mapas por página.
* **Autodetección:** Los mapas se inicializan automáticamente mediante atributos HTML `data-mapa` y `data-data-url`.
* **Datos servidos desde `public/`:** GeoJSON y estilos base disponibles localmente y listos para servir por CDN o jsDelivr.
* **Búsqueda geográfica:** Buscador integrado conectado a OpenStreetMap Nominatim y botón de reinicio de vista geográfica.
* **Tooltips editoriales:** Desglose interactivo con barras de proporción y colores oficiales de los partidos (PP, PSOE, Vox, Podemos, UxEx, etc.).

---

## 📁 Estructura del Proyecto

```text
mapas_elecciones_29N/
├── dist/
│   └── mapas-elecciones.js           # Bundle único generado para producción
├── public/
│   ├── datos/
│   │   ├── diferencia_votos_extremadura_limpio.geojson
│   │   ├── resultados-censo-21d.geojson
│   │   └── secciones_extremadura_votos.geojson
│   └── estilos/
│       └── base_DW_gray.json
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
│   │   ├── mapa_diferencia.js        # Mapa 1: Diferencia y mayor aumento
│   │   ├── mapa_autonomicas.js       # Mapa 2: Elecciones autonómicas y participación
│   │   └── mapa_generales.js         # Mapa 3: Elecciones generales
│   └── main.js                       # Auto-inicializador e inyector de estilos
├── index.html                        # Entorno local de pruebas con pestañas
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
   Abre `http://localhost:5173` en tu navegador para interactuar con los tres mapas.

3. **Compilar el paquete único para producción:**
   ```bash
   npm run build
   ```
   Genera el archivo optimizado en `dist/mapas-elecciones.js`.

---

## 📰 Integración en CMS Méthode

Para insertar cualquier mapa en un artículo o noticia mediante un **Módulo Código HTML**, se incluye el `<script>` y un `<div>` contenedor con los atributos `data-*`:

```html
<!-- Cargar el script empaquetado (preferiblemente con defer o al final) -->
<script defer src="https://cdn.jsdelivr.net/gh/antoniohh/Mapa29N@v1.0.0/dist/mapas-elecciones.js"></script>

<!-- Mapa 1: Diferencia de votos (mayor aumento por sección) -->
<div id="mapa-diferencia"
     data-mapa="diferencia"
     data-data-url="https://cdn.jsdelivr.net/gh/antoniohh/Mapa29N@v1.0.0/dist/datos/">
</div>

<!-- Mapa 2: Elecciones Autonómicas -->
<div id="mapa-autonomicas"
     data-mapa="autonomicas"
     data-data-url="https://cdn.jsdelivr.net/gh/antoniohh/Mapa29N@v1.0.0/dist/datos/">
</div>

<!-- Mapa 3: Elecciones Generales -->
<div id="mapa-generales"
     data-mapa="generales"
     data-data-url="https://cdn.jsdelivr.net/gh/antoniohh/Mapa29N@v1.0.0/dist/datos/">
</div>
```

---

## ⚙️ Atributos Data Disponibles

| Atributo | Valores permitidos | Descripción |
| :--- | :--- | :--- |
| `data-mapa` | `diferencia` (por defecto), `autonomicas`, `generales` | Tipo de mapa y visualización a renderizar. |
| `data-data-url` | URL o ruta relativa (ej. `/datos`) | URL base donde se encuentran alojados los archivos GeoJSON. |
| `data-style-url` | *(Opcional)* URL de estilo MapLibre | URL del JSON de estilo base (por defecto: `https://static.hoy.es/comun/html/base_DW_gray.json`). |

---

## 📄 Licencia y Términos de Uso

Este software ha sido desarrollado por y para el uso exclusivo de las cabeceras y servicios del grupo **Vocento**.

* **Propiedad:** © 2026 **Vocento** / **HOY.es**. Todos los derechos reservados.
* **Licencia:** Privativa (uso interno).
