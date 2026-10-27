import { Etapa, CrearEtapaDTO } from './etapa.types';

export interface ProcesoDB {
  id: number;
  nombre: string;
  descripcion: string | null;
  creado_por: number;
  activo: number;
  created_at: Date;
  updated_at: Date;
}

export interface Proceso {
  id: number;
  nombre: string;
  descripcion: string | null;
  creadoPor: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Proceso con sus etapas (para GET /api/procesos/:id)
export interface ProcesoConEtapas extends Proceso {
  etapas: Etapa[];
}

// Body de POST /api/procesos
export interface CrearProcesoDTO {
  nombre: string;
  descripcion?: string | null;
  etapas: CrearEtapaDTO[];
}

// Body de PATCH /api/procesos/:id
export interface ActualizarProcesoDTO {
  nombre?: string;
  descripcion?: string | null;
  activo?: boolean;
}

export const mapProceso = (row: ProcesoDB): Proceso => ({
  id: row.id,
  nombre: row.nombre,
  descripcion: row.descripcion,
  creadoPor: row.creado_por,
  activo: row.activo === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});