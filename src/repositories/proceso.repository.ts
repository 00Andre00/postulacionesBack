import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import {
  Proceso,
  ProcesoDB,
  ActualizarProcesoDTO,
  mapProceso,
} from '../types/proceso.types';

export const buscarPorId = async (id: number): Promise<Proceso | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM procesos WHERE id = ? LIMIT 1',
    [id]
  );
  if (rows.length === 0) return null;
  return mapProceso(rows[0] as ProcesoDB);
};

export const listarActivos = async (): Promise<Proceso[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM procesos WHERE activo = 1 ORDER BY created_at DESC'
  );
  return (rows as ProcesoDB[]).map(mapProceso);
};

export const listarTodos = async (): Promise<Proceso[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM procesos ORDER BY created_at DESC'
  );
  return (rows as ProcesoDB[]).map(mapProceso);
};

export const crearProceso = async (
  nombre: string,
  descripcion: string | null,
  creadoPor: number
): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO procesos (nombre, descripcion, creado_por, activo)
     VALUES (?, ?, ?, 1)`,
    [nombre, descripcion, creadoPor]
  );
  return result.insertId;
};

export const actualizarProceso = async (
  id: number,
  data: ActualizarProcesoDTO
): Promise<Proceso | null> => {
  const campos: string[] = [];
  const valores: unknown[] = [];

  if (data.nombre !== undefined) { campos.push('nombre = ?'); valores.push(data.nombre); }
  if (data.descripcion !== undefined) { campos.push('descripcion = ?'); valores.push(data.descripcion); }
  if (data.activo !== undefined) { campos.push('activo = ?'); valores.push(data.activo ? 1 : 0); }

  if (campos.length === 0) return buscarPorId(id);

  valores.push(id);
  await pool.query<ResultSetHeader>(
    `UPDATE procesos SET ${campos.join(', ')} WHERE id = ?`,
    valores
  );

  return buscarPorId(id);
};