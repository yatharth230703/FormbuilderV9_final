
import type { Buffer } from 'buffer';

let pdfParse: any = null;

// Lazy load pdf-parse using dynamic import for ES modules
export async function parsePdf(buffer: Buffer): Promise<{ text: string }> {
  if (!pdfParse) {
    try {
      // Use dynamic import for ES modules
      const pdfParseModule = await import('pdf-parse');
      pdfParse = pdfParseModule.default || pdfParseModule;
    } catch (error) {
      console.error('Failed to load pdf-parse:', error);
      throw new Error('PDF parsing is not available');
    }
  }
  
  try {
    const result = await pdfParse(buffer);
    return { text: result.text };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF document');
  }
}
