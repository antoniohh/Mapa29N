import { setWorkerUrl } from 'maplibre-gl';
import workerScript from 'maplibre-gl/dist/maplibre-gl-worker.mjs?raw';
import { renderMapaDiferencia } from './mapas/mapa_diferencia.js';
import { renderMapaAutonomicas } from './mapas/mapa_autonomicas.js';
import { renderMapaGenerales } from './mapas/mapa_generales.js';
import mapaStyles from './styles/mapa.css?inline';

// Inicializar el Web Worker de MapLibre en línea para evitar dependencias externas de archivos .mjs
if (typeof window !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
  try {
    const blob = new Blob([workerScript], { type: 'text/javascript' });
    setWorkerUrl(URL.createObjectURL(blob));
  } catch {
    setWorkerUrl('https://unpkg.com/maplibre-gl@6.16.0/dist/maplibre-gl-worker.mjs');
  }
}

/**
 * Inyecta una única vez los estilos de MapLibre y del componente en el <head>
 */
export function inyectarEstilos() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('mapas-elecciones-styles')) return;

  const style = document.createElement('style');
  style.id = 'mapas-elecciones-styles';
  style.textContent = mapaStyles;
  document.head.appendChild(style);
}

/**
 * Renderiza el mapa correspondiente dentro de un elemento contenedor HTML
 * según sus atributos data-*
 */
export function renderizarPorElemento(el) {
  if (!el || !el.id) return;

  const tipoMapa = (el.dataset.mapa || 'diferencia').toLowerCase();
  const dataUrl = el.dataset.dataUrl || '/datos';
  const styleUrl = el.dataset.styleUrl || undefined;

  const options = { dataUrl, styleUrl };

  switch (tipoMapa) {
    case 'autonomicas':
    case 'elecciones-autonomicas':
      renderMapaAutonomicas(el.id, options);
      break;

    case 'generales':
    case 'elecciones-generales':
      renderMapaGenerales(el.id, options);
      break;

    case 'diferencia':
    case 'diferencia-votos':
    default:
      renderMapaDiferencia(el.id, options);
      break;
  }
}

/**
 * Escanea el documento e inicializa automáticamente todos los mapas con atributo data-mapa
 */
export function autoInicializar() {
  inyectarEstilos();
  const selector = '[data-mapa]';
  document.querySelectorAll(selector).forEach(el => renderizarPorElemento(el));
}

// Auto-ejecución al cargar el DOM en el navegador (compatible con Méthode)
if (typeof window !== 'undefined') {
  // Exportar al objeto global de ventana para invocación programática en CMS si se requiere
  window.MapasElecciones = {
    renderizarPorElemento,
    autoInicializar,
    renderMapaDiferencia,
    renderMapaAutonomicas,
    renderMapaGenerales
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInicializar);
  } else {
    autoInicializar();
  }
}
