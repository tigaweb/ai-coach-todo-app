import { AIComment, AIConsultationRequest, TaskContext } from '../entities/AIComment';
import { IAICommentRepository } from '../repositories/AICommentRepository';
import { IAICoachRepository } from '../repositories/AICoachRepository';
import { IPromptRepository } from '../repositories/PromptRepository';
import { ITaskRepository } from '../repositories/TaskRepository';

export class AICoachUsecase {
  constructor(
    private aiCommentRepository: IAICommentRepository,
    private aiCoachRepository: IAICoachRepository,
    private promptRepository: IPromptRepository,
    private taskRepository: ITaskRepository
  ) {}

  async consultTask(taskId: number, userId: number, userInput: string): Promise<AIComment> {
    // 入力バリデーション
    if (!userInput || userInput.trim().length === 0) {
      throw new Error('相談内容を入力してください。');
    }

    if (userInput.length > 500) {
      throw new Error('相談内容は500文字以内で入力してください。');
    }

    // タスクの存在確認と権限チェック
    const task = await this.taskRepository.findByIdAndUserId(taskId, userId);
    if (!task) {
      throw new Error('タスクが見つかりません。');
    }

    // アクティブなプロンプトを取得
    const activePrompts = await this.promptRepository.findActive();
    const systemPrompt = activePrompts.length > 0 
      ? activePrompts[0].content 
      : 'あなたは優秀なタスク管理コーチです。ユーザーのタスクに対して建設的なアドバイスを500文字以内で提供してください。';

    // タスクコンテキストを構築
    const taskContext: TaskContext = {
      title: task.title,
      progress: task.progress,
      dueDate: task.dueDate,
      completionCriteria: task.completionCriteria,
      notes: task.notes
    };

    // AI相談リクエストを構築
    const consultationRequest: AIConsultationRequest = {
      taskId,
      userInput: userInput.trim(),
      taskContext,
      systemPrompt
    };

    try {
      // AI APIを呼び出してアドバイスを取得
      const aiResponse = await this.aiCoachRepository.generateAdvice(consultationRequest);

      // AIコメントをデータベースに保存
      const aiComment = await this.aiCommentRepository.create(
        taskId,
        userInput.trim(),
        aiResponse
      );

      return aiComment;
    } catch (error) {
      console.error('AI Consultation Error:', error);
      throw error;
    }
  }

  async getAIComments(taskId: number, userId: number): Promise<AIComment[]> {
    // タスクの存在確認と権限チェック
    const task = await this.taskRepository.findByIdAndUserId(taskId, userId);
    if (!task) {
      throw new Error('タスクが見つかりません。');
    }

    return await this.aiCommentRepository.findByTaskId(taskId);
  }

  async getAICommentById(commentId: number, userId: number): Promise<AIComment | null> {
    const comment = await this.aiCommentRepository.findById(commentId);
    if (!comment) {
      return null;
    }

    // タスクの権限チェック
    const task = await this.taskRepository.findByIdAndUserId(comment.taskId, userId);
    if (!task) {
      throw new Error('アクセス権限がありません。');
    }

    return comment;
  }
} 