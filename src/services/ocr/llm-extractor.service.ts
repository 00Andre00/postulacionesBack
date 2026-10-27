import { ocrConfig } from '../../config/ocr.config';
import { DatosCV } from '../../types/cv.types';

const PROMPT = `Eres un extractor de datos de CVs. Del siguiente texto, extrae SOLO estos campos en JSON:
- universidad: nombre de la universidad donde estudió (o null si no se menciona)
- profesion: profesión o título obtenido (o null)
- fechaTitulo: fecha de emisión del título en formato YYYY-MM-DD (o null)

Responde únicamente con el JSON, sin explicaciones.

Texto del CV:
`;

interface LlmRawResponse {
  universidad: string | null;
  profesion: string | null;
  fechaTitulo: string | null;
}

// Llama a Ollama (API compatible con OpenAI)
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

// Llama a OpenAI (u otro compatible con OpenAI API)
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

// Extrae datos con LLM. Devuelve null si el modo es 'rules' o si falla.
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

    return {
      universidad: resultado.universidad || null,
      profesion: resultado.profesion || null,
      fechaTitulo: resultado.fechaTitulo || null,
    };
  } catch (error) {
    console.warn('⚠️ LLM falló, se usan solo reglas:', error);
    return null;
  }
};