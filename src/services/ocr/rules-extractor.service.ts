import Fuse from 'fuse.js';
import { DatosCV } from '../../types/cv.types';

// ============================================
// LISTAS DE REFERENCIA
// ============================================
const UNIVERSIDADES = [
  'Pontificia Universidad Católica del Perú',
  'Universidad Nacional Mayor de San Marcos',
  'Universidad Peruana Cayetano Heredia',
  'Universidad del Pacífico',
  'Universidad de Lima',
  'Universidad Peruana de Ciencias Aplicadas',
  'Universidad Nacional de Ingeniería',
  'Universidad Nacional Agraria La Molina',
  'Universidad San Ignacio de Loyola',
  'Universidad de Huánuco',
  'UDH',
  'PUCP',
  'UNMSM',
  'UPCH',
  'UPC',
  'UNI',
  'UNALM',
  'USIL',
];

const PROFESIONES = [
  'Ingeniero de Sistemas', 'Ingeniero de Software', 'Ingeniero Informático',
  'Ingeniero Industrial', 'Ingeniero Civil', 'Ingeniero Mecánico',
  'Ingeniero Electrónico', 'Ingeniero Eléctrico', 'Ingeniero Químico',
  'Administrador', 'Contador', 'Economista', 'Abogado', 'Psicólogo',
  'Arquitecto', 'Médico', 'Enfermero', 'Comunicador', 'Periodista',
  'Diseñador Gráfico', 'Licenciado en Administración', 'Licenciado en Economía',
  'Bachiller en Ingeniería', 'Bachiller en Administración',
  'Bachiller en Ing. de Sistemas', 'Bachiller en Ingeniería de Sistemas',
  'Bachiller en Ing. Informática', 'Bachiller en Ingeniería Informática',
  'Bachiller en Ing. de Software', 'Bachiller en Ingeniería de Software',
  'Bachiller en Ing. Industrial', 'Bachiller en Ingeniería Industrial',
  'Bachiller en Ing. Civil', 'Bachiller en Ingeniería Civil',
  'Ing. de Sistemas', 'Ingeniería de Sistemas',
  'Ing. Informática', 'Ingeniería Informática',
  'Ing. de Software', 'Ingeniería de Software',
  'Ing. Industrial', 'Ingeniería Industrial',
  'Ing. Civil', 'Ingeniería Civil',
  'Lic. en Administración', 'Licenciatura en Administración',
  'Lic. en Economía', 'Licenciatura en Economía',
];

// ============================================
// BÚSQUEDA DIFUSA CON FUSE
// ============================================
const fuseUniversidades = new Fuse(UNIVERSIDADES, {
  threshold: 0.3,
  includeScore: true,
  ignoreLocation: true,
});

const buscarUniversidad = (texto: string): string | null => {
  let mejor: string | null = null;
  let mejorScore = 1;

  for (const uni of UNIVERSIDADES) {
    const res = Fuse.match(uni, texto, { threshold: 0.3, ignoreLocation: true });
    if (res && res.score < mejorScore) {
      mejorScore = res.score;
      mejor = uni;
    }
  }

  return mejor;
};

// ============================================
// EXTRACCIÓN DE PROFESIÓN
// ============================================
const buscarProfesion = (texto: string): string | null => {
  const textoLower = texto.toLowerCase();
  const ordenadas = [...PROFESIONES].sort((a, b) => b.length - a.length);

  for (const profesion of ordenadas) {
    if (textoLower.includes(profesion.toLowerCase())) {
      return profesion;
    }
  }
  return null;
};

// ============================================
// EXTRACCIÓN DE FECHA
// ============================================
const PATRONES_FECHA = [
  /\b(19|20)\d{2}[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b/,
  /\b(0?[1-9]|[12]\d|3[01])[-/](0?[1-9]|1[0-2])[-/](19|20)\d{2}\b/,
  /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(19|20)\d{2}\b/i,
];

// Año suelto: solo se acepta si aparece cerca de palabras de título/grado
const PATRON_ANIO_SUELTO = /\b(19|20)\d{2}\b/;
const CONTEXTO_TITULO = /\b(t[ií]tulo|bachiller|grado|egresad[oa]|graduad[oa])\b/i;

const buscarFecha = (texto: string): string | null => {
  // 1. Patrones de fecha completa (más confiables)
  for (const patron of PATRONES_FECHA) {
    const match = texto.match(patron);
    if (match) return match[0];
  }

  // 2. Buscar TODOS los años sueltos y verificar contexto de título en cada uno
  const regexAnios = /\b(19|20)\d{2}\b/g;
  let match: RegExpExecArray | null;

  while ((match = regexAnios.exec(texto)) !== null) {
    const indice = match.index;
    // Ventana más amplia: 200 caracteres antes y después
    const ventana = texto.slice(Math.max(0, indice - 200), indice + 200);
    if (CONTEXTO_TITULO.test(ventana)) {
      return match[0];
    }
  }

  return null;
};

const MESES: Record<string, string> = {
  enero: '01', febrero: '02', marzo: '03', abril: '04',
  mayo: '05', junio: '06', julio: '07', agosto: '08',
  septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12',
};

const normalizarFecha = (fecha: string | null): string | null => {
  if (!fecha) return null;

  // YYYY-MM-DD o YYYY/MM/DD
  const iso = fecha.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (iso) {
    const [, y, m, d] = iso;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD/MM/YYYY o DD-MM-YYYY
  const dmy = fecha.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // "junio 2020" / "Jun 2020"
  const mesAnio = fecha.toLowerCase().match(/^([a-záéíóú]+)\s+(\d{4})$/);
  if (mesAnio && MESES[mesAnio[1]]) {
    return `${mesAnio[2]}-${MESES[mesAnio[1]]}-01`;
  }

  // Año suelto → null (no inventamos "YYYY-01-01")
  return null;
};

// ============================================
// EXTRACTOR PRINCIPAL
// ============================================
export const extraerConReglas = (texto: string): DatosCV => {
  const cabecera = texto.slice(0, 3000);

  const universidad = buscarUniversidad(cabecera);
  const profesion = buscarProfesion(cabecera);
  const fechaTitulo = normalizarFecha(buscarFecha(cabecera));

  return { universidad, profesion, fechaTitulo };
};