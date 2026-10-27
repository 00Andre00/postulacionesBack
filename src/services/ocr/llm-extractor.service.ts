import { ocrConfig } from '../../config/ocr.config';
import { DatosCV } from '../../types/cv.types';

const PROMPT = `Eres un extractor de datos de CVs. Analiza el texto y devuelve un JSON con EXACTAMENTE estos tres campos:

- "universidad": string con el nombre de la universidad, o null si no aparece.
- "profesion": string con la profesión o grado (ej: "Bachiller en Ingeniería de Sistemas"), o null si no aparece.
- "fechaTitulo": string en formato "YYYY-MM-DD" SOLO si el texto menciona explícitamente una fecha asociada al título o grado. Si el texto solo menciona un año (ej: "2026"), devuelve "2026-01-01". Si el texto NO menciona ninguna fecha asociada al título, devuelve null. NO inventes fechas.

REGLAS ESTRICTAS:
1. Si no estás seguro de un campo, devuelve null. NUNCA inventes datos.
2. Si el texto dice "Bachiller en X" pero no menciona cuándo, "fechaTitulo" debe ser null.
3. Responde SOLO con el JSON, sin texto adicional.

Ejemplo de respuesta válida:
{"universidad": "Universidad de Huánuco", "profesion": "Bachiller en Ing. de Sistemas", "fechaTitulo": null}

Texto del CV:
`;

interface LlmRawResponse {
  universidad: string | null;
  profesion: string | null;
  fechaTitulo: string | null;
}

const llamarOllama = async (texto: string): Promise<LlmRawResponse> => {
  const response = await fetch(`${ocrConfig.ollamaBaseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ocrConfig.ollamaModel,
      prompt: PROMPT + texto,
      stream: false,
      format: 'json',
    }),
  });

  if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
  const data = await response.json();
  return JSON.parse(data.response);
};

const llamarOpenAI = async (texto: string): Promise<LlmRawResponse> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ocrConfig.llmApiKey}`,
    },
    body: JSON.stringify({
      model: ocrConfig.llmModel,
      messages: [
        { role: 'system', content: 'Responde solo JSON válido.' },
        { role: 'user', content: PROMPT + texto },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};

// ============================================
// VALIDACIÓN DE FECHAS DEVUELTAS POR EL LLM
// ============================================
// Si el LLM devuelve una fecha pero el texto NO contiene ese año,
// la descartamos (el modelo alucinó).
const validarFechaLLM = (fechaLlm: string | null, texto: string): string | null => {
  if (!fechaLlm) return null;

  const anioMatch = fechaLlm.match(/^(\d{4})/);
  if (!anioMatch) return null;

  const anio = anioMatch[1];
  if (texto.includes(anio)) {
    return fechaLlm;
  }

  return null;
};

// ============================================
// EXTRACCIÓN CON LLM
// ============================================
export const extraerConLLM = async (texto: string): Promise<DatosCV | null> => {
  if (ocrConfig.isRulesOnly) return null;

  try {
    let resultado: LlmRawResponse;

    if (ocrConfig.isOllama) {
      resultado = await llamarOllama(texto);
    } else if (ocrConfig.isCloud) {
      resultado = await llamarOpenAI(texto);
    } else {
      return null;
    }

    // Validación: descartar fechas inventadas por el modelo
    const fechaValidada = validarFechaLLM(resultado.fechaTitulo, texto);

    return {
      universidad: resultado.universidad || null,
      profesion: resultado.profesion || null,
      fechaTitulo: fechaValidada,
    };
  } catch (error) {
    console.warn('⚠️ LLM falló, se usan solo reglas:', error);
    return null;
  }
};