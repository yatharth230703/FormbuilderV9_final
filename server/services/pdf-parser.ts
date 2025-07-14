import pdfParse from 'pdf-parse';

export async function parsePdf(buffer: Buffer): Promise<{ text: string }> {
  try {
    const data = await pdfParse(buffer);
    return { text: data.text };
  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF document - the file may be corrupted or unsupported');
  }
}