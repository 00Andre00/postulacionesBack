export interface DatosCV {
  universidad: string | null;
  profesion: string | null;
  fechaTitulo: string | null; // formato YYYY-MM-DD
}

export interface ResultadoExtraccion extends DatosCV {
  textoOcr: string;
  extraidoPor: 'reglas' | 'ollama' | 'cloud' | 'manual';
}