import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import fs from 'fs/promises';

// Extrae texto de un PDF. Si no tiene capa de texto, hace OCR con Tesseract.
export const extraerTextoDePDF = async (rutaPDF: string): Promise<string> => {
  const buffer = await fs.readFile(rutaPDF);

  // Intento 1: capa de texto del PDF (rápido, preciso si existe)
  try {
    const data = await pdfParse(buffer);
    const texto = data.text?.trim();
    if (texto && texto.length > 50) {
      console.log(`📄 Texto extraído de capa del PDF (${texto.length} caracteres)`);
      return texto;
    }
  } catch (err) {
    console.warn('pdf-parse falló, se intentará OCR:', err);
  }

  // Intento 2: Tesseract OCR (para PDFs escaneados)
  console.log('🔍 PDF sin capa de texto, ejecutando Tesseract OCR...');
  const result = await Tesseract.recognize(rutaPDF, 'spa', {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        // opcional: console.log(`   OCR: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  const texto = result.data.text?.trim() || '';
  console.log(`🔍 Texto extraído por Tesseract (${texto.length} caracteres)`);
  return texto;
};