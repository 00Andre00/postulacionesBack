import pool from '../config/database';
import {
  Usuario,
  UsuarioDB,
  CrearUsuarioDTO,
  ActualizarUsuarioDTO,
  mapUsuario,
} from '../types/usuario.types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Buscar por username (para login)
export const buscarPorUsername = async (username: string): Promise<UsuarioDB | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM usuarios WHERE username = ? LIMIT 1',
    [username]
  );
  if (rows.length === 0) return null;
  return rows[0] as UsuarioDB;
};

// Buscar por id
export const buscarPorId = async (id: number): Promise<Usuario | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM usuarios WHERE id = ? LIMIT 1',
    [id]
  );
  if (rows.length === 0) return null;
  return mapUsuario(rows[0] as UsuarioDB);
};

// Buscar por DNI (útil para evitar duplicados de postulantes)
export const buscarPorDni = async (dni: string): Promise<Usuario | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM usuarios WHERE dni = ? LIMIT 1',
    [dni]
  );
  if (rows.length === 0) return null;
  return mapUsuario(rows[0] as UsuarioDB);
};

// Crear usuario y devolver el objeto creado
export const crearUsuario = async (data: CrearUsuarioDTO): Promise<Usuario> => {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO usuarios 
     (nombre, apellido, dni, username, password_hash, rol, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.nombre,
      data.apellido,
      data.dni ?? null,
      data.username,
      data.password_hash,
      data.rol,
      data.expires_at ?? null,
    ]
  );

  const creado = await buscarPorId(result.insertId);
  if (!creado) throw new Error('No se pudo recuperar el usuario recién creado');
  return creado;
};

// Actualizar campos sueltos (construcción dinámica de SET)
export const actualizarUsuario = async (
  id: number,
  data: ActualizarUsuarioDTO
): Promise<Usuario | null> => {
  const campos: string[] = [];
  const valores: unknown[] = [];

  if (data.nombre !== undefined) { campos.push('nombre = ?'); valores.push(data.nombre); }
  if (data.apellido !== undefined) { campos.push('apellido = ?'); valores.push(data.apellido); }
  if (data.dni !== undefined) { campos.push('dni = ?'); valores.push(data.dni); }
  if (data.username !== undefined) { campos.push('username = ?'); valores.push(data.username); }
  if (data.password_hash !== undefined) { campos.push('password_hash = ?'); valores.push(data.password_hash); }
  if (data.rol !== undefined) { campos.push('rol = ?'); valores.push(data.rol); }
  if (data.activo !== undefined) { campos.push('activo = ?'); valores.push(data.activo ? 1 : 0); }
  if (data.expires_at !== undefined) { campos.push('expires_at = ?'); valores.push(data.expires_at); }

  if (campos.length === 0) return buscarPorId(id);

  valores.push(id);
  await pool.query<ResultSetHeader>(
    `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
    valores
  );

  return buscarPorId(id);
};

// Listar usuarios por rol (útil para el panel de admin)
export const listarPorRol = async (rol: string): Promise<Usuario[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM usuarios WHERE rol = ? ORDER BY created_at DESC',
    [rol]
  );
  return (rows as UsuarioDB[]).map(mapUsuario);
};

// Verificar si un usuario temporal expiró
export const estaExpirado = (usuario: Usuario): boolean => {
  if (!usuario.expiresAt) return false;
  return new Date(usuario.expiresAt) < new Date();
};