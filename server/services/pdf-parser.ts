
import type { Buffer } from 'buffer';

let pdfjsLib: any = null;
let initializationAttempted = false;

// Production-ready PDF parser with better error handling
export async function parsePdf(buffer: Buffer): Promise<{ text: string }> {
  if (!pdfjsLib && !initializationAttempted) {
    initializationAttempted = true;
    try {
      // Use dynamic import for pdfjs-dist
      pdfjsLib = await import('pdfjs-dist');
      
      // Disable worker in production environment to avoid potential issues
      if (process.env.NODE_ENV === 'production') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = null;
      }
      
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
  
  // Check if buffer looks like a PDF
  if (buffer.length < 4 || buffer.toString('ascii', 0, 4) !== '%PDF') {
    throw new Error('The uploaded file is not a valid PDF document');
  }
  
  try {
    // Convert buffer to Uint8Array for pdfjs-dist
    const uint8Array = new Uint8Array(buffer);
    
    // Load the PDF document with production-safe options
    const loadingTask = pdfjsLib.getDocument({ 
      data: uint8Array,
      verbosity: 0, // Suppress console output
      useWorkerFetch: false, // Disable worker fetch in production
      isEvalSupported: false, // Disable eval for security
      stopAtErrors: false, // Continue processing even if some pages fail
      maxImageSize: 16777216, // 16MB limit for images
      cMapUrl: null, // Disable cmap loading
      cMapPacked: false
    });
    
    // Set a timeout for PDF loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('PDF loading timeout')), 30000); // 30 second timeout
    });
    
    const pdfDocument = await Promise.race([loadingTask.promise, timeoutPromise]);
    
    if (!pdfDocument) {
      throw new Error('Failed to load PDF document');
    }
    
    let fullText = '';
    const numPages = pdfDocument.numPages;
    
    // Limit the number of pages to prevent memory issues
    const maxPages = Math.min(numPages, 50); // Process maximum 50 pages
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine all text items from the page
        const pageText = textContent.items
          .filter((item: any) => item.str && typeof item.str === 'string')
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
        
        // Clean up page resources
        page.cleanup();
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
    
    // Clean up the extracted text
    const cleanedText = fullText
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
      .trim();
    
    return { text: cleanedText };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF') || error.message.includes('not a valid PDF')) {
        throw new Error('The uploaded file is not a valid PDF document');
      } else if (error.message.includes('password')) {
        throw new Error('The PDF is password protected and cannot be processed');
      } else if (error.message.includes('corrupted')) {
        throw new Error('The PDF file appears to be corrupted');
      } else if (error.message.includes('timeout')) {
        throw new Error('PDF processing timed out - the file may be too large or complex');
      }
    }
    throw new Error('Failed to parse PDF document - the file may be corrupted or unsupported');
  }
}
