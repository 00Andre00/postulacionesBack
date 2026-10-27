import { extraerTextoDePDF } from './text-extractor.service';
import { extraerConReglas } from './rules-extractor.service';
import { extraerConLLM } from './llm-extractor.service';
import { ocrConfig } from '../../config/ocr.config';
import { ResultadoExtraccion } from '../../types/cv.types';

export const procesarCV = async (rutaPDF: string): Promise<ResultadoExtraccion> => {
  // 1. Obtener texto (capa PDF o Tesseract)
  const texto = await extraerTextoDePDF(rutaPDF);

  // 2. Extracción por reglas (siempre)
  const datosReglas = extraerConReglas(texto);

  // 3. Si hay LLM, completar campos faltantes
  let datosFinales = datosReglas;
  let extraidoPor: ResultadoExtraccion['extraidoPor'] = 'reglas';

  if (!ocrConfig.isRulesOnly) {
    const datosLLM = await extraerConLLM(texto);
    if (datosLLM) {
      datosFinales = {
        universidad: datosReglas.universidad || datosLLM.universidad,
        profesion: datosReglas.profesion || datosLLM.profesion,
        fechaTitulo: datosReglas.fechaTitulo || datosLLM.fechaTitulo,
      };
      extraidoPor = ocrConfig.isOllama ? 'ollama' : 'cloud';
    }
  }

  return {
    ...datosFinales,
    textoOcr: texto,
    extraidoPor,
  };
};