import { PoolConnection } from 'mysql2/promise';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Etapa, EtapaDB, mapEtapa, TipoEtapa } from '../types/etapa.types';

// Lista las etapas de un proceso ordenadas
export const listarPorProceso = async (procesoId: number): Promise<Etapa[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM etapas WHERE proceso_id = ? ORDER BY orden ASC',
    [procesoId]
  );
  return (rows as EtapaDB[]).map(mapEtapa);
};

// Inserta una etapa usando una conexión externa (para transacciones)
export const insertarConConexion = async (
  conn: PoolConnection,
  procesoId: number,
  orden: number,
  nombre: string,
  tipo: TipoEtapa,
  descripcion: string | null
): Promise<number> => {
  const [result] = await conn.query<ResultSetHeader>(
    `INSERT INTO etapas (proceso_id, orden, nombre, tipo, descripcion)
     VALUES (?, ?, ?, ?, ?)`,
    [procesoId, orden, nombre, tipo, descripcion]
  );
  return result.insertId;
};

// Elimina todas las etapas de un proceso (para reemplazo si hiciera falta)
export const eliminarPorProceso = async (procesoId: number): Promise<void> => {
  await pool.query<ResultSetHeader>('DELETE FROM etapas WHERE proceso_id = ?', [procesoId]);
};