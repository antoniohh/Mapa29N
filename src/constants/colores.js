/**
 * Paleta de colores oficial para visualización electoral
 */
export const COLORES_PARTIDOS = {
  PP: '#0056A3',
  PSOE: '#E30613',
  VOX: '#63BE21',
  SUMAR: '#E51C55',
  PODEMOS: '#6B2E68',
  UXEX: '#9169F4',
  CS: '#EB6109',
  BQEX: '#009540',
  PACMA: '#1D9B51',
  JUNTS: '#00C4B3',
  OTROS: '#A0A0A0'
};

/**
 * Normaliza el nombre del partido a una clave estándar
 */
export function cleanPartyName(name) {
  if (!name) return '';
  const p = String(name).trim();
  const upper = p.toUpperCase();

  if (upper === 'PP' || upper.includes('POPULAR')) return 'PP';
  if (upper === 'PSOE' || upper.includes('SOCIALISTA')) return 'PSOE';
  if (upper === 'VOX') return 'Vox';
  if (upper === 'SUMAR') return 'Sumar';
  if (upper === 'UXEX' || upper.includes('UNIDAS POR EXTREMADURA')) return 'UxEx';
  if (upper === 'PODEMOS' || upper.includes('UNIDAS PODEMOS')) return 'Podemos';
  if (upper === 'CS' || upper.includes('CIUDADANOS')) return 'Cs';
  if (upper === 'BQEX' || upper.includes('EXTREME')) return 'BQEX';
  if (upper === 'PACMA') return 'PACMA';
  return p;
}

/**
 * Obtiene el código hexadecimal correspondiente a un partido
 */
export function getColorForParty(partyName) {
  const p = cleanPartyName(partyName);
  switch (p) {
    case 'PP': return COLORES_PARTIDOS.PP;
    case 'PSOE': return COLORES_PARTIDOS.PSOE;
    case 'Vox': return COLORES_PARTIDOS.VOX;
    case 'Sumar': return COLORES_PARTIDOS.SUMAR;
    case 'Podemos': return COLORES_PARTIDOS.PODEMOS;
    case 'UxEx': return COLORES_PARTIDOS.UXEX;
    case 'Cs': return COLORES_PARTIDOS.CS;
    case 'BQEX': return COLORES_PARTIDOS.BQEX;
    case 'PACMA': return COLORES_PARTIDOS.PACMA;
    default: return COLORES_PARTIDOS.OTROS;
  }
}
