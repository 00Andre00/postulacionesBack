import { Request, Response } from 'express';
import {
  crearProcesoConEtapas,
  obtenerProcesoConEtapas,
  editarProceso,
} from '../services/proceso.service';
import { listarActivos, listarTodos } from '../repositories/proceso.repository';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CrearProcesoDTO, ActualizarProcesoDTO } from '../types/proceso.types';

// Público: cualquiera puede ver los procesos activos
export const listarProcesosHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const procesos = await listarActivos();
    res.json(procesos);
  } catch {
    res.status(500).json({ error: 'Error al listar procesos' });
  }
};

// Solo admin/encargado: ver todos (incluidos inactivos)
export const listarTodosProcesosHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const procesos = await listarTodos();
    res.json(procesos);
  } catch {
    res.status(500).json({ error: 'Error al listar procesos' });
  }
};

export const obtenerProcesoHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }
    const proceso = await obtenerProcesoConEtapas(id);
    if (!proceso) {
      res.status(404).json({ error: 'Proceso no encontrado' });
      return;
    }
    res.json(proceso);
  } catch {
    res.status(500).json({ error: 'Error al obtener el proceso' });
  }
};

export const crearProcesoHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    const data = req.body as CrearProcesoDTO;
    const creado = await crearProcesoConEtapas(data, req.user.userId);
    res.status(201).json(creado);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al crear proceso';
    // Si es un error de validación (mensaje controlado), 400; si no, 500
    const esValidacion = [
      'El nombre del proceso es obligatorio',
      'El proceso debe tener al menos una etapa',
      'La primera etapa del proceso debe ser de tipo "cv"',
      'El proceso debe tener exactamente una etapa de tipo "cv"',
      'Cada etapa debe tener un nombre',
    ].some((m) => mensaje.startsWith(m)) || mensaje.startsWith('Tipo de etapa inválido');

    res.status(esValidacion ? 400 : 500).json({ error: mensaje });
  }
};

export const editarProcesoHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }
    const data = req.body as ActualizarProcesoDTO;
    const actualizado = await editarProceso(id, data);
    if (!actualizado) {
      res.status(404).json({ error: 'Proceso no encontrado' });
      return;
    }
    res.json(actualizado);
  } catch {
    res.status(500).json({ error: 'Error al editar el proceso' });
  }
};