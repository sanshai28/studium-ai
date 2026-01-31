import { GoogleGenerativeAI } from '@google/generative-ai';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

interface Message {
  role: string;
  content: string;
}

interface Source {
  id: string;
  fileName: string;
  fileType: string;
  filePath: string;
}

class AIService {
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async extractTextFromFile(filePath: string, fileType: string): Promise<string> {
    const absolutePath = path.join(__dirname, '../../uploads', filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    try {
      if (fileType === 'application/pdf') {
        const dataBuffer = fs.readFileSync(absolutePath);
        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        await parser.destroy();
        return result.text;
      }

      if (
        fileType === 'application/msword' ||
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const result = await mammoth.extractRawText({ path: absolutePath });
        return result.value;
      }

      if (fileType === 'text/plain' || fileType === 'text/markdown') {
        return fs.readFileSync(absolutePath, 'utf-8');
      }

      // For images, we'll return a placeholder (Gemini can process images separately)
      if (fileType.startsWith('image/')) {
        return `[Image file: ${path.basename(filePath)}]`;
      }

      return `[Unsupported file type: ${fileType}]`;
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  }

  async generateAnswer(
    question: string,
    sources: Source[],
    conversationHistory: Message[] = []
  ): Promise<string> {
    try {
      // Extract text from all sources
      const sourceContents: string[] = [];
      for (const source of sources) {
        try {
          const text = await this.extractTextFromFile(source.filePath, source.fileType);
          sourceContents.push(`--- ${source.fileName} ---\n${text}\n`);
        } catch (error) {
          console.error(`Error processing source ${source.fileName}:`, error);
          sourceContents.push(`--- ${source.fileName} ---\n[Error reading file]\n`);
        }
      }

      // Build context
      const context = sourceContents.join('\n\n');

      // Build conversation history for chat
      const historyForPrompt = conversationHistory
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      const prompt = `You are a helpful AI assistant that answers questions based on the provided source documents.

SOURCE DOCUMENTS:
${context}

${historyForPrompt ? `CONVERSATION HISTORY:\n${historyForPrompt}\n\n` : ''}
USER QUESTION: ${question}

Instructions:
- Answer the question based ONLY on the information in the source documents
- If the answer cannot be found in the sources, say so clearly
- Be concise but thorough
- Reference which source document contains the relevant information when possible

YOUR ANSWER:`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating answer:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
export default aiService;
