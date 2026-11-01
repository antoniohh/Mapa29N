import { LngLatBounds } from 'maplibre-gl';

/**
 * Prepara la estructura interna del contenedor (buscador y canvas del mapa)
 * aislada por cada instancia para evitar colisiones de IDs en Méthode.
 */
export function inicializarDOMContenedor(container) {
  container.classList.add('voc-map-contenedor');
  container.innerHTML = `
    <div class="voc-map-search-box">
      <input type="text" class="voc-map-search-input" placeholder="Buscar calle o municipio..." />
      <button class="voc-map-search-button" type="button">Buscar</button>
    </div>
    <div class="voc-map-canvas" style="width: 100%; height: 100%; position: relative; z-index: 1;"></div>
  `;

  const canvasEl = container.querySelector('.voc-map-canvas');
  const searchInput = container.querySelector('.voc-map-search-input');
  const searchBtn = container.querySelector('.voc-map-search-button');

  return { canvasEl, searchInput, searchBtn };
}

/**
 * Conecta el buscador de OpenStreetMap Nominatim al mapa
 */
export function conectarBuscador(map, searchInput, searchBtn) {
  function ejecutarBusqueda() {
    const query = searchInput.value.trim();
    if (!query) return;

    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=es&q=${encodeURIComponent(query)}`;
    fetch(searchUrl)
      .then(res => res.json())
      .then(results => {
        if (results && results.length > 0) {
          map.flyTo({
            center: [parseFloat(results[0].lon), parseFloat(results[0].lat)],
            zoom: 14,
            essential: true
          });
        } else {
          alert('No se encontraron resultados para la búsqueda.');
        }
      })
      .catch(err => {
        console.error('Error al realizar la búsqueda en OSM Nominatim:', err);
      });
  }

  searchBtn.addEventListener('click', ejecutarBusqueda);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ejecutarBusqueda();
  });
}

/**
 * Añade el botón personalizado de reset de límites al mapa
 */
export function agregarBotonReset(map, bounds, padding = 35) {
  const resetButton = document.createElement('div');
  resetButton.className = 'maplibregl-ctrl maplibregl-ctrl-group';
  resetButton.innerHTML = `
    <button type="button" style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;" title="Reiniciar vista">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M16 24V16H24V19H19V24H16ZM5 24V19H0V16H8V24H5ZM16 8V0H19V5H24V8H16ZM8 8H0V5H5V0H8V8Z" fill="#202020"/>
      </svg>
    </button>
  `;

  resetButton.onclick = () => {
    if (bounds && !bounds.isEmpty()) {
      map.fitBounds(bounds, { padding });
    }
  };

  map.addControl({
    onAdd: () => resetButton,
    onRemove: () => resetButton.parentNode?.removeChild(resetButton)
  }, 'bottom-right');
}

/**
 * Calcula los límites (bounds) geográficos a partir de las features de un GeoJSON
 */
export function calcularBounds(features) {
  const bounds = new LngLatBounds();
  features.forEach(feature => {
    if (feature.geometry && feature.geometry.coordinates) {
      const coordinates = feature.geometry.coordinates.flat(Infinity);
      for (let i = 0; i < coordinates.length; i += 2) {
        if (!isNaN(coordinates[i]) && !isNaN(coordinates[i + 1])) {
          bounds.extend([coordinates[i], coordinates[i + 1]]);
        }
      }
    }
  });
  return bounds;
}
