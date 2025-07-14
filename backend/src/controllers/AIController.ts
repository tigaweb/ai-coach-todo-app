import { Context } from 'hono';
import { AICoachUsecase } from '../usecases/AICoachUsecase';
import { CreateAICommentRequest } from '../entities/AIComment';

export class AIController {
  constructor(private aiCoachUsecase: AICoachUsecase) {}

  async consultTask(c: Context) {
    try {
      const user = c.get('user');
      const taskId = parseInt(c.req.param('id'));
      const body = await c.req.json() as CreateAICommentRequest;
      
      if (isNaN(taskId)) {
        return c.json({ error: '無効なタスクIDです。' }, 400);
      }

      if (!body.userInput) {
        return c.json({ error: '相談内容を入力してください。' }, 400);
      }

      const aiComment = await this.aiCoachUsecase.consultTask(taskId, user.id, body.userInput);
      return c.json({ aiComment });
    } catch (error) {
      console.error('AI Consult Error:', error);
      return c.json({ error: error instanceof Error ? error.message : 'AI相談に失敗しました。' }, 400);
    }
  }

  async getTaskComments(c: Context) {
    try {
      const user = c.get('user');
      const taskId = parseInt(c.req.param('id'));
      
      if (isNaN(taskId)) {
        return c.json({ error: '無効なタスクIDです。' }, 400);
      }

      const comments = await this.aiCoachUsecase.getAIComments(taskId, user.id);
      return c.json({ comments });
    } catch (error) {
      console.error('Get Task Comments Error:', error);
      return c.json({ error: error instanceof Error ? error.message : 'コメントの取得に失敗しました。' }, 400);
    }
  }

  async getCommentById(c: Context) {
    try {
      const user = c.get('user');
      const commentId = parseInt(c.req.param('id'));
      
      if (isNaN(commentId)) {
        return c.json({ error: '無効なコメントIDです。' }, 400);
      }

      const comment = await this.aiCoachUsecase.getAICommentById(commentId, user.id);
      
      if (!comment) {
        return c.json({ error: 'コメントが見つかりません。' }, 404);
      }

      return c.json({ comment });
    } catch (error) {
      console.error('Get Comment Error:', error);
      return c.json({ error: error instanceof Error ? error.message : 'コメントの取得に失敗しました。' }, 400);
    }
  }
} 