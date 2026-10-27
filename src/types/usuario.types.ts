// Roles posibles en el sistema
export type Rol = 'admin' | 'encargado' | 'postulante';

// Lo que viene de la base de datos (fila completa)
export interface UsuarioDB {
  id: number;
  nombre: string;
  apellido: string;
  dni: string | null;
  username: string;
  password_hash: string;
  rol: Rol;
  activo: number; // MySQL devuelve TINYINT(1) como 0/1
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Lo que se usa en la aplicación (sin password_hash)
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string | null;
  username: string;
  rol: Rol;
  activo: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Para crear un usuario nuevo
export interface CrearUsuarioDTO {
  nombre: string;
  apellido: string;
  dni?: string | null;
  username: string;
  password_hash: string;
  rol: Rol;
  expires_at?: Date | null;
}

// Para actualizar campos sueltos
export interface ActualizarUsuarioDTO {
  nombre?: string;
  apellido?: string;
  dni?: string | null;
  username?: string;
  password_hash?: string;
  rol?: Rol;
  activo?: boolean;
  expires_at?: Date | null;
}

// Helper para convertir fila de BD a objeto de app
export const mapUsuario = (row: UsuarioDB): Usuario => ({
  id: row.id,
  nombre: row.nombre,
  apellido: row.apellido,
  dni: row.dni,
  username: row.username,
  rol: row.rol,
  activo: row.activo === 1,
  expiresAt: row.expires_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});