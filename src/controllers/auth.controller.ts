import { Request, Response } from 'express';
import { login } from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { buscarPorId } from '../repositories/usuario.repository';
import { LoginDTO } from '../types/auth.types';

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as LoginDTO;

    if (!username || !password) {
      res.status(400).json({ error: 'Username y password son obligatorios' });
      return;
    }

    const resultado = await login({ username, password });
    res.json(resultado);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error en login';
    res.status(401).json({ error: mensaje });
  }
};

// Endpoint para que el frontend sepa quién está logueado
export const meHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    const usuario = await buscarPorId(req.user.userId);
    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};