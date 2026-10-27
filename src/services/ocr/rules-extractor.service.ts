import { DatosCV } from '../../types/cv.types';

// Lista de universidades comunes (ampliable)
const UNIVERSIDADES = [
  'Universidad Nacional Mayor de San Marcos',
  'Universidad Nacional de Ingeniería',
  'Universidad Nacional de San Agustín',
  'Universidad Nacional de Trujillo',
  'Pontificia Universidad Católica del Perú',
  'Universidad de Lima',
  'Universidad del Pacífico',
  'Universidad Peruana Cayetano Heredia',
  'Universidad Nacional Federico Villarreal',
  'Universidad Tecnológica del Perú',
  'Universidad César Vallejo',
  'Universidad San Ignacio de Loyola',
  'Universidad ESAN',
  // siglas
  'UNMSM', 'UNI', 'UNSA', 'UNT', 'PUCP', 'ULima', 'UP', 'UPCH', 'UNFV', 'UTP', 'UCV', 'USIL',
];

// Profesiones comunes
const PROFESIONES = [
  'Ingeniero de Sistemas', 'Ingeniero de Software', 'Ingeniero Informático',
  'Ingeniero Industrial', 'Ingeniero Civil', 'Ingeniero Mecánico',
  'Ingeniero Electrónico', 'Ingeniero Eléctrico', 'Ingeniero Químico',
  'Administrador', 'Contador', 'Economista', 'Abogado', 'Psicólogo',
  'Arquitecto', 'Médico', 'Enfermero', 'Comunicador', 'Periodista',
  'Diseñador Gráfico', 'Licenciado en Administración', 'Licenciado en Economía',
  'Bachiller en Ingeniería', 'Bachiller en Administración',
];

// Busca el nombre más cercano a una palabra clave
const buscarConocido = (texto: string, lista: string[]): string | null => {
  const textoLower = texto.toLowerCase();
  // Ordena por longitud descendente para preferir el match más específico
  const ordenadas = [...lista].sort((a, b) => b.length - a.length);
  for (const item of ordenadas) {
    if (textoLower.includes(item.toLowerCase())) {
      return item;
    }
  }
  return null;
};

// Regex de fecha (múltiples formatos)
const PATRONES_FECHA = [
  // 2020-06-15, 2020/06/15
  /\b(19|20)\d{2}[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b/,
  // 15/06/2020, 15-06-2020
  /\b(0?[1-9]|[12]\d|3[01])[-/](0?[1-9]|1[0-2])[-/](19|20)\d{2}\b/,
  // junio 2020, Jun 2020
  /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(19|20)\d{2}\b/i,
];

const buscarFecha = (texto: string): string | null => {
  for (const patron of PATRONES_FECHA) {
    const match = texto.match(patron);
    if (match) return match[0];
  }
  return null;
};

// Normaliza fechas a YYYY-MM-DD cuando sea posible
const normalizarFecha = (fecha: string | null): string | null => {
  if (!fecha) return null;

  // ya está en formato YYYY-MM-DD o YYYY/MM/DD
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

  // mes nombre año → devolver YYYY-MM-01
  const nombres: Record<string, string> = {
    enero: '01', febrero: '02', marzo: '03', abril: '04',
    mayo: '05', junio: '06', julio: '07', agosto: '08',
    septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12',
  };
  const mesAnio = fecha.toLowerCase().match(/^([a-záéíóú]+)\s+(\d{4})$/);
  if (mesAnio && nombres[mesAnio[1]]) {
    return `${mesAnio[2]}-${nombres[mesAnio[1]]}-01`;
  }

  return null;
};

// Extrae datos por reglas
export const extraerConReglas = (texto: string): DatosCV => {
  // Limita la búsqueda de universidad/profesión a las primeras ~3000 caracteres
  // (donde suele estar "Educación / Formación académica")
  const cabecera = texto.slice(0, 3000);

  const universidad = buscarConocido(cabecera, UNIVERSIDADES);
  const profesion = buscarConocido(cabecera, PROFESIONES);
  const fechaTitulo = normalizarFecha(buscarFecha(cabecera));

  return {
    universidad,
    profesion,
    fechaTitulo,
  };
};