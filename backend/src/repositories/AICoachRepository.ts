import OpenAI from 'openai';
import { AIConsultationRequest } from '../entities/AIComment';

export interface IAICoachRepository {
  generateAdvice(request: AIConsultationRequest): Promise<string>;
}

export class AICoachRepository implements IAICoachRepository {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000'), // 30秒
    });
  }

  async generateAdvice(request: AIConsultationRequest): Promise<string> {
    try {
      const prompt = this.buildPrompt(request);
      
      const response = await this.openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: request.systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: parseInt(process.env.MAX_TOKENS || '500'),
        temperature: 0.7,
      });

      const advice = response.choices[0]?.message?.content || 'アドバイスを生成できませんでした。';
      
      // 500文字以内に制限
      return advice.length > 500 ? advice.substring(0, 500) + '...' : advice;
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error('AI相談サービスに接続できませんでした。しばらく後に再試行してください。');
    }
  }

  private buildPrompt(request: AIConsultationRequest): string {
    const { taskContext, userInput, systemPrompt } = request;
    
    return `
タスク情報:
- タイトル: ${taskContext.title}
- 進捗: ${taskContext.progress}%
- 完了予定日: ${taskContext.dueDate ? taskContext.dueDate.toISOString().split('T')[0] : '未設定'}
- 完了条件: ${taskContext.completionCriteria || '未設定'}
- 備考: ${taskContext.notes || '未設定'}

相談内容: ${userInput}

${systemPrompt}
    `.trim();
  }
} 