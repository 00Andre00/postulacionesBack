import { Request, Response, NextFunction } from 'express';
import { verificarToken } from '../services/auth.service';
import { JwtPayload } from '../types/auth.types';

// Extendemos Request para que los handlers puedan acceder al usuario logueado
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const requiereAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = header.slice(7); // quitar "Bearer "

  try {
    const payload = verificarToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Factory: requiere un rol específico (o varios)
export const requiereRol = (...rolesPermitidos: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      res.status(403).json({ error: 'No tienes permiso para esta acción' });
      return;
    }
    next();
  };
};