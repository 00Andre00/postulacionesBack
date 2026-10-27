import pool from '../config/database';
import { crearProceso, buscarPorId, actualizarProceso } from '../repositories/proceso.repository';
import { listarPorProceso, insertarConConexion } from '../repositories/etapa.repository';
import {
  CrearProcesoDTO,
  ProcesoConEtapas,
  ActualizarProcesoDTO,
} from '../types/proceso.types';

const TIPOS_VALIDOS = ['cv', 'entrevista', 'tecnica', 'otro'];

// Validaciones antes de tocar la base de datos
const validarCreacion = (data: CrearProcesoDTO): void => {
  if (!data.nombre || data.nombre.trim().length === 0) {
    throw new Error('El nombre del proceso es obligatorio');
  }
  if (!Array.isArray(data.etapas) || data.etapas.length === 0) {
    throw new Error('El proceso debe tener al menos una etapa');
  }

  // La primera etapa debe ser tipo 'cv'
  if (data.etapas[0].tipo !== 'cv') {
    throw new Error('La primera etapa del proceso debe ser de tipo "cv"');
  }

  // Solo una etapa tipo 'cv' en todo el proceso
  const cantidadCv = data.etapas.filter((e) => e.tipo === 'cv').length;
  if (cantidadCv !== 1) {
    throw new Error('El proceso debe tener exactamente una etapa de tipo "cv"');
  }

  // Tipos válidos y nombres no vacíos
  for (const etapa of data.etapas) {
    if (!TIPOS_VALIDOS.includes(etapa.tipo)) {
      throw new Error(`Tipo de etapa inválido: ${etapa.tipo}`);
    }
    if (!etapa.nombre || etapa.nombre.trim().length === 0) {
      throw new Error('Cada etapa debe tener un nombre');
    }
  }
};

export const crearProcesoConEtapas = async (
  data: CrearProcesoDTO,
  creadoPor: number
): Promise<ProcesoConEtapas> => {
  validarCreacion(data);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Insertar el proceso
    const [procesoResult] = await conn.query<any>(
      `INSERT INTO procesos (nombre, descripcion, creado_por, activo)
       VALUES (?, ?, ?, 1)`,
      [data.nombre.trim(), data.descripcion ?? null, creadoPor]
    );
    const procesoId = procesoResult.insertId;

    // 2. Insertar cada etapa (orden inferido por posición)
    for (let i = 0; i < data.etapas.length; i++) {
      const etapa = data.etapas[i];
      await insertarConConexion(
        conn,
        procesoId,
        i + 1, // orden 1-based
        etapa.nombre.trim(),
        etapa.tipo,
        etapa.descripcion ?? null
      );
    }

    await conn.commit();

    const proceso = await buscarPorId(procesoId);
    if (!proceso) throw new Error('No se pudo recuperar el proceso creado');

    const etapas = await listarPorProceso(procesoId);
    return { ...proceso, etapas };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const obtenerProcesoConEtapas = async (
  id: number
): Promise<ProcesoConEtapas | null> => {
  const proceso = await buscarPorId(id);
  if (!proceso) return null;
  const etapas = await listarPorProceso(id);
  return { ...proceso, etapas };
};

export const editarProceso = async (
  id: number,
  data: ActualizarProcesoDTO
): Promise<ProcesoConEtapas | null> => {
  const existente = await buscarPorId(id);
  if (!existente) return null;

  const actualizado = await actualizarProceso(id, data);
  if (!actualizado) return null;

  const etapas = await listarPorProceso(id);
  return { ...actualizado, etapas };
};