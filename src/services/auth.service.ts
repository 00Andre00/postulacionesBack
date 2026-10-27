import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { buscarPorUsername, estaExpirado } from '../repositories/usuario.repository';
import { mapUsuario } from '../types/usuario.types';
import { JwtPayload, LoginDTO, LoginResponse } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en .env');
}

export const login = async (data: LoginDTO): Promise<LoginResponse> => {
  const usuarioDB = await buscarPorUsername(data.username);
  if (!usuarioDB) {
    throw new Error('Credenciales inválidas');
  }

  const passwordOk = await bcrypt.compare(data.password, usuarioDB.password_hash);
  if (!passwordOk) {
    throw new Error('Credenciales inválidas');
  }

  const usuario = mapUsuario(usuarioDB);

  if (!usuario.activo) {
    throw new Error('La cuenta está desactivada');
  }

  // Solo los postulantes tienen expiración
  if (usuario.rol === 'postulante' && estaExpirado(usuario)) {
    throw new Error('La cuenta temporal del postulante ha expirado');
  }

  const payload: JwtPayload = {
    userId: usuario.id,
    username: usuario.username,
    rol: usuario.rol,
  };

  const token = jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN as any,
  });

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      username: usuario.username,
      rol: usuario.rol,
    },
    expiresAt: usuario.expiresAt,
  };
};

export const verificarToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
};