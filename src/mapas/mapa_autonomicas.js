import { Map, NavigationControl, Popup } from 'maplibre-gl';
import { getColorForParty, cleanPartyName } from '../constants/colores.js';
import {
  getProp,
  parsePercentage,
  formatPorc,
  resolverLocalidad,
  extraerSubtituloSeccion
} from '../utils/formatters.js';
import {
  inicializarDOMContenedor,
  conectarBuscador,
  agregarBotonReset,
  calcularBounds
} from '../utils/controls.js';

export async function renderMapaAutonomicas(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const dataUrl = (options.dataUrl || '/datos').replace(/\/$/, '');
  const styleUrl = options.styleUrl || 'https://static.hoy.es/comun/html/base_DW_gray.json';
  const geojsonUrl = dataUrl.endsWith('.geojson') ? dataUrl : `${dataUrl}/resultados-censo-21d.geojson`;

  const { canvasEl, searchInput, searchBtn } = inicializarDOMContenedor(container);

  // Loader indicador
  const loader = document.createElement('div');
  loader.className = 'voc-map-loader';
  loader.innerHTML = '<div class="voc-map-spinner"></div><span>Cargando datos autonómicos...</span>';
  container.appendChild(loader);

  const map = new Map({
    container: canvasEl,
    style: styleUrl,
    center: [-6.34, 39.47],
    zoom: 7
  });

  map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
  conectarBuscador(map, searchInput, searchBtn);

  map.on('load', async () => {
    try {
      const res = await fetch(geojsonUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} al solicitar ${geojsonUrl}`);
      const data = await res.json();

      loader.remove();

      // Asignar color de coropleta según el partido ganador
      data.features.forEach(feature => {
        const props = feature.properties || {};
        const primerPartido = getProp(props, ['primero', 'p1', 'ganador', 'partido_ganador', 'partido']);
        props.color_coropleta = getColorForParty(primerPartido);
      });

      map.addSource('municipios', {
        type: 'geojson',
        data
      });

      map.addLayer({
        id: 'municipios-fill',
        type: 'fill',
        source: 'municipios',
        paint: {
          'fill-color': ['get', 'color_coropleta'],
          'fill-opacity': 0.75
        }
      });

      map.addLayer({
        id: 'municipios-line',
        type: 'line',
        source: 'municipios',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 0.5
        }
      });

      const bounds = calcularBounds(data.features);
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 40 });
      }

      agregarBotonReset(map, bounds, 40);

      // Tooltip interactivo
      const popup = new Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12
      });

      map.on('mousemove', 'municipios-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const props = e.features[0].properties;
        const { localidad, cusecStr } = resolverLocalidad(props);
        const seccionSubtitle = extraerSubtituloSeccion(props, cusecStr);

        const rawPart = getProp(props, ['participacion_porc', 'porc_participacion', 'participacion', 'particip', 'part_porc', 'part']);
        const partNum = parsePercentage(rawPart, true);
        const participacionText = formatPorc(partNum);

        const partiesRaw = [
          {
            name: getProp(props, ['primero', 'p1', 'ganador']),
            val: getProp(props, ['primero_porc', 'primero_pct', 'p1_porc', 'porc_primero', 'porc_1'])
          },
          {
            name: getProp(props, ['segundo', 'p2']),
            val: getProp(props, ['segundo_porc', 'segundo_pct', 'p2_porc', 'porc_segundo', 'porc_2'])
          },
          {
            name: getProp(props, ['tercero', 'p3']),
            val: getProp(props, ['tercero_porc', 'tercero_pct', 'p3_porc', 'porc_tercero', 'porc_3'])
          },
          {
            name: getProp(props, ['cuarto', 'p4']),
            val: getProp(props, ['cuarto_porc', 'cuarto_pct', 'p4_porc', 'porc_cuarto', 'porc_4'])
          }
        ];

        let resultsHtml = '';
        partiesRaw.forEach(item => {
          if (!item.name || item.name === '-' || item.name.toLowerCase() === 'null') return;
          const cleanName = cleanPartyName(item.name);
          const num = parsePercentage(item.val, false);
          const pctText = formatPorc(num);
          const color = getColorForParty(cleanName);
          const barWidth = num !== null ? num : 0;

          resultsHtml += `
            <div class="voc-party-row">
              <div class="voc-party-info">
                <span class="voc-party-dot" style="background-color:${color};"></span>
                <span class="voc-party-name" title="${cleanName}">${cleanName}</span>
              </div>
              <div class="voc-party-bar-track">
                <div class="voc-party-bar-fill" style="width:${barWidth}%; background-color:${color};"></div>
              </div>
              <span class="voc-party-pct">${pctText}</span>
            </div>
          `;
        });

        const htmlContent = `
          <div class="voc-custom-tooltip">
            <div class="voc-tooltip-header">
              <span class="voc-tooltip-title">${localidad}</span>
              ${seccionSubtitle ? `<span class="voc-tooltip-subtitle">${seccionSubtitle}</span>` : ''}
            </div>
            <div class="voc-tooltip-metric">
              <span class="voc-metric-label">Participación</span>
              <span class="voc-metric-value">${participacionText}</span>
            </div>
            <div class="voc-tooltip-results">
              ${resultsHtml}
            </div>
          </div>
        `;

        popup.setLngLat(e.lngLat).setHTML(htmlContent).addTo(map);
      });

      map.on('mouseleave', 'municipios-fill', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });

    } catch (err) {
      loader.remove();
      console.error('Error al cargar el mapa de elecciones autonómicas:', err);
      container.innerHTML += `<div style="padding: 16px; color: #d83b01; font-size: 13px;">Error al cargar datos del mapa: ${err.message}</div>`;
    }
  });

  return map;
}
