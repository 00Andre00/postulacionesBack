export type OcrMode = 'rules' | 'ollama' | 'cloud';

const mode = (process.env.OCR_MODE || 'rules') as OcrMode;

export const ocrConfig = {
  mode,
  isRulesOnly: mode === 'rules',
  isOllama: mode === 'ollama',
  isCloud: mode === 'cloud',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3.1',
  llmProvider: process.env.LLM_PROVIDER || 'openai',
  llmApiKey: process.env.LLM_API_KEY || '',
  llmModel: process.env.LLM_MODEL || 'gpt-4o-mini',
};

export const logOcrMode = (): void => {
  console.log(`🔍 Modo OCR: ${ocrConfig.mode}`);
  if (ocrConfig.isOllama) {
    console.log(`   Ollama: ${ocrConfig.ollamaBaseUrl} (${ocrConfig.ollamaModel})`);
  }
  if (ocrConfig.isCloud) {
    console.log(`   LLM nube: ${ocrConfig.llmProvider} (${ocrConfig.llmModel})`);
  }
};