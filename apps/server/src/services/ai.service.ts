import https from 'https';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { AISchema, type AIOutput } from '@/validators/ai-output.validator';

export class AIService {
  private makePostRequest(url: string, payload: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const postData = JSON.stringify(payload);

      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP Status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.write(postData);
      req.end();
    });
  }

  private assemblePrompt(subject: string, topic: string, grade: string, numQuestions: number, formats: string[]): string {
    return `You are an expert educator. Design a structured academic assessment on the subject: "${subject}" and topic: "${topic}" for grade/class: "${grade}".
The total number of questions must be exactly ${numQuestions}.
The selected formats for questions must be chosen from: ${formats.join(', ')}.

OUTPUT INSTRUCTIONS:
You must output strictly a single valid JSON object matching the following TypeScript interface contract:

interface AIOutput {
  assignmentTitle: string;
  sections: Array<{
    title: string;
    instruction: string;
    questions: Array<{
      question: string;
      difficulty: 'easy' | 'medium' | 'hard' | 'expert';
      marks: number;
      type: string;
    }>;
  }>;
}

IMPORTANT: Never wrap the JSON in Markdown code blocks (like \`\`\`json ... \`\`\`). Never output any additional intro or outro text. Return only the raw JSON string.`;
  }

  private generateMockOutput(subject: string, topic: string, numQuestions: number, formats: string[]): AIOutput {
    const questionsList = Array(numQuestions).fill(null).map((_, i) => {
      const type = formats[i % formats.length] || 'multiple-choice';
      const questionText = `Explain the core architectures of ${topic} and clarify how it implements fundamental concepts in ${subject} engineering (Question #${i + 1}).`;
      
      return {
        question: questionText,
        difficulty: (i % 4 === 0 ? 'easy' : i % 4 === 1 ? 'medium' : i % 4 === 2 ? 'hard' : 'expert') as any,
        marks: i % 2 === 0 ? 5 : 10,
        type,
      };
    });

    return {
      assignmentTitle: `${subject} Assessment: ${topic}`,
      sections: [
        {
          title: `Section A: ${topic} Fundamentals`,
          instruction: 'Answer all questions in this section showing detailed logical steps.',
          questions: questionsList,
        }
      ]
    };
  }

  private sanitizeAndParse(raw: string): any {
    // Strip markdown wrappers if present (e.g. ```json ... ``` or ``` ... ```)
    let cleaned = raw.trim();
    cleaned = cleaned.replace(/^```(json)?/i, '');
    cleaned = cleaned.replace(/```$/, '');
    cleaned = cleaned.trim();

    return JSON.parse(cleaned);
  }

  public async generateAssessment(subject: string, topic: string, grade: string, numQuestions: number, formats: string[]): Promise<AIOutput> {
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      logger.info('💡 No GEMINI_API_KEY detected in env. Falling back to the resilient mock NLP generator.');
      const mockResult = this.generateMockOutput(subject, topic, numQuestions, formats);
      return AISchema.parse(mockResult);
    }

    const prompt = this.assemblePrompt(subject, topic, grade, numQuestions, formats);
    const model = env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        logger.info(`🤖 Dispatching AI Content Generation attempt #${attempts}/${maxAttempts} to Gemini API`);
        const responseData = await this.makePostRequest(url, payload);
        const parsedResponse = JSON.parse(responseData);
        
        const rawText = parsedResponse.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          throw new Error('Malformed API response structure: No text block found.');
        }

        const parsedJson = this.sanitizeAndParse(rawText);
        
        // Zod validation check
        const validatedOutput = AISchema.parse(parsedJson);
        logger.info('✅ AI output successfully validated against schema contract.');
        return validatedOutput;
      } catch (error: any) {
        logger.warn(`⚠️ AI Generation attempt #${attempts} failed: ${error.message}`);
        if (attempts >= maxAttempts) {
          logger.warn('🚨 Max AI generation attempts reached. Falling back to safe mock assessment generation.');
          const mockResult = this.generateMockOutput(subject, topic, numQuestions, formats);
          return AISchema.parse(mockResult);
        }
        // Small delay before retrying
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    return this.generateMockOutput(subject, topic, numQuestions, formats);
  }
}

export const aiService = new AIService();
export default aiService;
