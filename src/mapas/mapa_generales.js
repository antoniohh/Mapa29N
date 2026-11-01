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

export async function renderMapaGenerales(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const dataUrl = (options.dataUrl || '/datos').replace(/\/$/, '');
  const styleUrl = options.styleUrl || 'https://static.hoy.es/comun/html/base_DW_gray.json';
  const geojsonUrl = dataUrl.endsWith('.geojson') ? dataUrl : `${dataUrl}/secciones_extremadura_votos.geojson`;

  const { canvasEl, searchInput, searchBtn } = inicializarDOMContenedor(container);

  // Loader indicador
  const loader = document.createElement('div');
  loader.className = 'voc-map-loader';
  loader.innerHTML = '<div class="voc-map-spinner"></div><span>Cargando datos elecciones generales...</span>';
  container.appendChild(loader);

  const map = new Map({
    container: canvasEl,
    style: styleUrl,
    center: [-6.15, 39.15],
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

      // Asignar color de coropleta según partido_ganador
      data.features.forEach(feature => {
        const props = feature.properties || {};
        const ganador = getProp(props, ['partido_ganador', 'ganador', 'primero', 'p1']);
        props.color_coropleta = getColorForParty(ganador);
      });

      map.addSource('secciones-electorales', {
        type: 'geojson',
        data
      });

      map.addLayer({
        id: 'secciones-fill',
        type: 'fill',
        source: 'secciones-electorales',
        paint: {
          'fill-color': ['coalesce', ['get', 'color_coropleta'], '#A0A0A0'],
          'fill-opacity': 0.75
        }
      });

      map.addLayer({
        id: 'secciones-line',
        type: 'line',
        source: 'secciones-electorales',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 0.5,
          'line-opacity': 0.6
        }
      });

      const bounds = calcularBounds(data.features);
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 30 });
      }

      agregarBotonReset(map, bounds, 30);

      // Tooltip interactivo
      const popup = new Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12
      });

      map.on('mousemove', 'secciones-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const props = e.features[0].properties;
        const { localidad, cusecStr } = resolverLocalidad(props);
        const seccionSubtitle = extraerSubtituloSeccion(props, cusecStr);

        const partyList = [];
        const keys = Object.keys(props);

        keys.forEach(key => {
          const lower = key.toLowerCase();
          let partyName = null;

          if (lower.startsWith('pct_') || lower.startsWith('porc_')) {
            partyName = key.replace(/^(pct_|porc_)/i, '').trim();
          } else if (lower.endsWith('_pct') || lower.endsWith('_porc')) {
            partyName = key.replace(/(_pct|_porc)$/i, '').trim();
          }

          if (partyName && !partyName.toLowerCase().includes('ganador') && !partyName.toLowerCase().includes('participacion')) {
            const num = parsePercentage(props[key]);
            if (num !== null && num > 0) {
              partyList.push({ name: partyName, pct: num });
            }
          }
        });

        // Si no vienen columnas pct_, calcular con base en votos totales
        if (partyList.length === 0) {
          const totalVotos = getProp(props, ['total_votos_candidaturas', 'total_votos', 'votos_validos']);
          if (totalVotos && typeof totalVotos === 'number' && totalVotos > 0) {
            ['PP', 'PSOE', 'VOX', 'SUMAR', 'BQEX', 'PODEMOS', 'CS'].forEach(pName => {
              const v = props[pName];
              if (typeof v === 'number' && v > 0) {
                partyList.push({ name: pName, pct: (v / totalVotos) * 100 });
              }
            });
          }
        }

        partyList.sort((a, b) => b.pct - a.pct);
        const displayParties = partyList.slice(0, 4);

        let resultsHtml = '';
        if (displayParties.length === 0) {
          resultsHtml = '<div style="font-size:12px;color:#767676;padding:4px 0;">Sin votos registrados</div>';
        } else {
          displayParties.forEach(item => {
            const cleanName = cleanPartyName(item.name);
            const color = getColorForParty(cleanName);
            const pctText = formatPorc(item.pct);
            const barWidth = item.pct !== null ? item.pct : 0;

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
        }

        const htmlContent = `
          <div class="voc-custom-tooltip">
            <div class="voc-tooltip-header">
              <span class="voc-tooltip-title">${localidad}</span>
              ${seccionSubtitle ? `<span class="voc-tooltip-subtitle">${seccionSubtitle}</span>` : ''}
            </div>
            <div class="voc-tooltip-results">
              ${resultsHtml}
            </div>
          </div>
        `;

        popup.setLngLat(e.lngLat).setHTML(htmlContent).addTo(map);
      });

      map.on('mouseleave', 'secciones-fill', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });

    } catch (err) {
      loader.remove();
      console.error('Error al cargar el mapa de elecciones generales:', err);
      container.innerHTML += `<div style="padding: 16px; color: #d83b01; font-size: 13px;">Error al cargar datos del mapa: ${err.message}</div>`;
    }
  });

  return map;
}
