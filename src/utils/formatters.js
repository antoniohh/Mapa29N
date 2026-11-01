import { MUNICIPIOS_EXTREMADURA } from '../constants/municipios.js';

/**
 * Busca de forma flexible una propiedad entre varios posibles alias
 */
export function getProp(props, possibleNames) {
  if (!props) return null;
  const lowerNames = possibleNames.map(n => n.toLowerCase());
  for (const key of Object.keys(props)) {
    if (lowerNames.includes(key.toLowerCase())) {
      const val = props[key];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return val;
      }
    }
  }
  return null;
}

/**
 * Convierte un valor de porcentaje a número flotante normalizado entre 0 y 100
 */
export function parsePercentage(val, isParticipation = false) {
  if (val === undefined || val === null) return null;
  let s = String(val).trim();
  if (!s || s === '-' || s.toLowerCase() === 'null' || s.toLowerCase() === 'nan' || s === '#n/a') {
    return null;
  }
  s = s.replace(/%/g, '').replace(/\u00a0/g, ' ').trim();
  if (s.includes('.') && s.includes(',')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }

  let num = parseFloat(s);
  if (isNaN(num)) return null;

  while (num > 100) {
    num = num / 100;
  }

  if (isParticipation) {
    if (num > 0 && num <= 1) num = num * 100;
  } else {
    if (num > 0 && num < 1) num = num * 100;
  }

  return Math.min(Math.max(num, 0), 100);
}

/**
 * Formatea un número porcentual a string con coma decimal (ej. '42,15%')
 */
export function formatPorc(num) {
  if (num === null || isNaN(num)) return '-';
  return num.toFixed(2).replace('.', ',') + '%';
}

/**
 * Parsea un diferencial de votos (puede ser positivo o negativo)
 */
export function parseDiff(val) {
  if (val === undefined || val === null) return null;
  let s = String(val).trim();
  if (!s || s === '-' || s.toLowerCase() === 'null' || s.toLowerCase() === 'nan' || s === '#n/a') {
    return null;
  }
  s = s.replace(/%/g, '').replace(/\u00a0/g, ' ').trim();
  if (s.includes('.') && s.includes(',')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}

/**
 * Formatea un diferencial con signo +/- (ej. '+3,50%', '-2,10%')
 */
export function formatDiff(num) {
  if (num === null || isNaN(num)) return '-';
  const formatted = Math.abs(num).toFixed(2).replace('.', ',') + '%';
  if (num > 0) return '+' + formatted;
  if (num < 0) return '-' + formatted;
  return '0,00%';
}

/**
 * Formatea y limpia nombres de municipios ("Albuera, La" -> "La Albuera")
 */
export function formatPlaceName(str) {
  if (!str) return 'Municipio';
  let s = String(str).trim();
  s = s.replace(/^\d+[\s\-_]+/, '');
  if (s.includes(',')) {
    const commaParts = s.split(',');
    if (commaParts.length === 2 && /^(el|la|los|las)$/i.test(commaParts[1].trim())) {
      s = commaParts[1].trim() + ' ' + commaParts[0].trim();
    }
  }
  const words = s.toLowerCase().split(/\s+/);
  const minorWords = ['de', 'del', 'la', 'las', 'los', 'el', 'en', 'y', 'e', "d'"];
  return words.map((word, idx) => {
    if (idx > 0 && minorWords.includes(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

/**
 * Obtiene el nombre del municipio resolviendo por cusec (código INE de 5 dígitos) si es necesario
 */
export function resolverLocalidad(props) {
  const seccionCode = getProp(props, ['cusec', 'csec', 'seccion', 'sec']) || '';
  const cusecStr = String(seccionCode).trim();
  let rawLocalidad = getProp(props, ['municipio', 'nombre', 'nmun', 'localidad', 'desc_mun', 'nom_mun']);

  if (!rawLocalidad && cusecStr.length >= 5) {
    const cumun = cusecStr.substring(0, 5);
    if (MUNICIPIOS_EXTREMADURA[cumun]) {
      rawLocalidad = MUNICIPIOS_EXTREMADURA[cumun];
    }
  }
  return {
    localidad: formatPlaceName(rawLocalidad || 'Municipio'),
    cusecStr
  };
}

/**
 * Obtiene el subtítulo 'Distrito X · Sección Y' a partir de props o cusec
 */
export function extraerSubtituloSeccion(props, cusecStr) {
  const distritoProp = getProp(props, ['distrito', 'cdis']);
  const seccionProp = getProp(props, ['seccion', 'csec']);

  if (distritoProp && seccionProp) {
    const d = parseInt(distritoProp, 10);
    const s = parseInt(seccionProp, 10);
    return (!isNaN(d) && !isNaN(s)) ? `Distrito ${d} · Sección ${s}` : `Sección ${seccionProp}`;
  } else if (cusecStr && cusecStr.length === 10) {
    const d = parseInt(cusecStr.substring(5, 7), 10);
    const s = parseInt(cusecStr.substring(7, 10), 10);
    return (!isNaN(d) && !isNaN(s)) ? `Distrito ${d} · Sección ${s}` : `Sección ${cusecStr}`;
  } else if (cusecStr) {
    return `Sección ${cusecStr}`;
  }
  return '';
}
