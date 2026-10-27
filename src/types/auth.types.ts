import { Rol } from './usuario.types';

// Payload que va dentro del JWT
export interface JwtPayload {
  userId: number;
  username: string;
  rol: Rol;
}

// Lo que devuelve el login exitoso
export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    username: string;
    rol: Rol;
  };
  expiresAt?: Date | null;
}

// Body que llega al endpoint POST /api/auth/login
export interface LoginDTO {
  username: string;
  password: string;
}