import { Router } from 'express';
import {
  listarProcesosHandler,
  listarTodosProcesosHandler,
  obtenerProcesoHandler,
  crearProcesoHandler,
  editarProcesoHandler,
} from '../controllers/proceso.controller';
import { requiereAuth, requiereRol } from '../middlewares/auth.middleware';

const router = Router();

// Público: procesos activos (para el postulante sin login)
router.get('/', listarProcesosHandler);

// Admin/encargado: ver todos (incluye inactivos)
router.get('/todos', requiereAuth, requiereRol('admin', 'encargado'), listarTodosProcesosHandler);

// Público: detalle con etapas
router.get('/:id', obtenerProcesoHandler);

// Admin/encargado: crear y editar
router.post('/', requiereAuth, requiereRol('admin', 'encargado'), crearProcesoHandler);
router.patch('/:id', requiereAuth, requiereRol('admin', 'encargado'), editarProcesoHandler);

export default router;