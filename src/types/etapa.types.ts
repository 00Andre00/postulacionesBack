export type TipoEtapa = 'cv' | 'entrevista' | 'tecnica' | 'otro';

export interface EtapaDB {
  id: number;
  proceso_id: number;
  orden: number;
  nombre: string;
  tipo: TipoEtapa;
  descripcion: string | null;
  created_at: Date;
}

export interface Etapa {
  id: number;
  procesoId: number;
  orden: number;
  nombre: string;
  tipo: TipoEtapa;
  descripcion: string | null;
  createdAt: Date;
}

// Para crear (el orden se infiere por posición)
export interface CrearEtapaDTO {
  nombre: string;
  tipo: TipoEtapa;
  descripcion?: string | null;
}

export const mapEtapa = (row: EtapaDB): Etapa => ({
  id: row.id,
  procesoId: row.proceso_id,
  orden: row.orden,
  nombre: row.nombre,
  tipo: row.tipo,
  descripcion: row.descripcion,
  createdAt: row.created_at,
});