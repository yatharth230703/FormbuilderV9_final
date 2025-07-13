
import type { Buffer } from 'buffer';

let pdfjsLib: any = null;
let initializationAttempted = false;

// Lazy load pdfjs-dist using dynamic import
export async function parsePdf(buffer: Buffer): Promise<{ text: string }> {
  if (!pdfjsLib && !initializationAttempted) {
    initializationAttempted = true;
    try {
      // Use dynamic import for pdfjs-dist
      pdfjsLib = await import('pdfjs-dist');
      console.log('PDF.js library successfully initialized');
    } catch (error) {
      console.error('Failed to load pdfjs-dist:', error);
      throw new Error('PDF parsing is not available - PDF.js failed to load');
    }
  }
  
  if (!pdfjsLib) {
    throw new Error('PDF parsing is not available - PDF.js not initialized');
  }
  
  // Validate input buffer
  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid PDF buffer provided');
  }
  
  try {
    // Convert buffer to Uint8Array for pdfjs-dist
    const uint8Array = new Uint8Array(buffer);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ 
      data: uint8Array,
      verbosity: 0 // Suppress console output
    });
    
    const pdfDocument = await loadingTask.promise;
    
    let fullText = '';
    const numPages = pdfDocument.numPages;
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine all text items from the page
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        
        fullText += pageText + '\n';
      } catch (pageError) {
        console.warn(`Error extracting text from page ${pageNum}:`, pageError);
        // Continue with other pages even if one fails
      }
    }
    
    // Clean up the document
    await pdfDocument.destroy();
    
    // Validate result
    if (typeof fullText !== 'string') {
      throw new Error('PDF parsing returned invalid result');
    }
    
    return { text: fullText.trim() };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('The uploaded file is not a valid PDF document');
      } else if (error.message.includes('password')) {
        throw new Error('The PDF is password protected and cannot be processed');
      } else if (error.message.includes('corrupted')) {
        throw new Error('The PDF file appears to be corrupted');
      }
    }
    throw new Error('Failed to parse PDF document - the file may be corrupted or unsupported');
  }
}
