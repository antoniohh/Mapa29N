import { Map, NavigationControl, Popup } from 'maplibre-gl';
import { getColorForParty } from '../constants/colores.js';
import {
  parseDiff,
  formatDiff,
  resolverLocalidad,
  extraerSubtituloSeccion
} from '../utils/formatters.js';
import {
  inicializarDOMContenedor,
  conectarBuscador,
  agregarBotonReset,
  calcularBounds
} from '../utils/controls.js';

export async function renderMapaDiferencia(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const dataUrl = (options.dataUrl || '/datos').replace(/\/$/, '');
  const styleUrl = options.styleUrl || 'https://static.hoy.es/comun/html/base_DW_gray.json';
  const geojsonUrl = `${dataUrl}/diferencia_votos_extremadura_limpio.geojson`;

  const { canvasEl, searchInput, searchBtn } = inicializarDOMContenedor(container);

  // Loader indicador
  const loader = document.createElement('div');
  loader.className = 'voc-map-loader';
  loader.innerHTML = '<div class="voc-map-spinner"></div><span>Cargando datos...</span>';
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

      // Precalcular el partido con mayor incremento por cada sección
      const diffMap = [
        { key: 'vox_dif', name: 'Vox' },
        { key: 'pp_dif', name: 'PP' },
        { key: 'podemos_dif', name: 'Podemos' },
        { key: 'psoe_dif', name: 'PSOE' }
      ];

      data.features.forEach(feature => {
        const props = feature.properties || {};
        let maxIncrease = 0;
        let partidoMayorAumento = null;

        diffMap.forEach(item => {
          const num = parseDiff(props[item.key]);
          if (num !== null && num > maxIncrease) {
            maxIncrease = num;
            partidoMayorAumento = item.name;
          }
        });

        if (partidoMayorAumento) {
          props.color_coropleta = getColorForParty(partidoMayorAumento);
          props.partido_mayor_aumento = partidoMayorAumento;
        } else {
          props.color_coropleta = '#A0A0A0';
          props.partido_mayor_aumento = null;
        }
      });

      map.addSource('diferencia-votos', {
        type: 'geojson',
        data
      });

      map.addLayer({
        id: 'diferencia-fill',
        type: 'fill',
        source: 'diferencia-votos',
        paint: {
          'fill-color': ['coalesce', ['get', 'color_coropleta'], '#A0A0A0'],
          'fill-opacity': 0.75
        }
      });

      map.addLayer({
        id: 'diferencia-line',
        type: 'line',
        source: 'diferencia-votos',
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

      map.on('mousemove', 'diferencia-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const props = e.features[0].properties;
        const { localidad, cusecStr } = resolverLocalidad(props);
        const seccionSubtitle = extraerSubtituloSeccion(props, cusecStr);

        const diffParties = [];
        diffMap.forEach(item => {
          const num = parseDiff(props[item.key]);
          if (num !== null) {
            diffParties.push({ name: item.name, diff: num });
          }
        });

        diffParties.sort((a, b) => b.diff - a.diff);

        let resultsHtml = '';
        if (diffParties.length === 0) {
          resultsHtml = '<div style="font-size:12px;color:#767676;padding:4px 0;">Sin datos de diferencia</div>';
        } else {
          diffParties.forEach(item => {
            const partyColor = getColorForParty(item.name);
            const diffText = formatDiff(item.diff);
            const barWidth = Math.min(Math.round((Math.abs(item.diff) / 25) * 100), 100);
            const numColor = item.diff > 0 ? '#107c10' : (item.diff < 0 ? '#d83b01' : '#555555');

            resultsHtml += `
              <div class="voc-party-row">
                <div class="voc-party-info">
                  <span class="voc-party-dot" style="background-color:${partyColor};"></span>
                  <span class="voc-party-name" title="${item.name}">${item.name}</span>
                </div>
                <div class="voc-party-bar-track">
                  <div class="voc-party-bar-fill" style="width:${barWidth}%; background-color:${partyColor};"></div>
                </div>
                <span class="voc-party-pct" style="color:${numColor};">${diffText}</span>
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

      map.on('mouseleave', 'diferencia-fill', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });

    } catch (err) {
      loader.remove();
      console.error('Error al cargar el mapa de diferencia de votos:', err);
      container.innerHTML += `<div style="padding: 16px; color: #d83b01; font-size: 13px;">Error al cargar datos del mapa: ${err.message}</div>`;
    }
  });

  return map;
}
