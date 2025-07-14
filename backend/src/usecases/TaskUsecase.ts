import { CreateTaskRequest, Task, UpdateTaskRequest } from "../entities/Task";
import { ITaskRepository } from "../repositories/TaskRepository";

export class TaskUsecase {
  constructor(private taskRepository: ITaskRepository) { }

  async getAllTasks(userId: number): Promise<Task[]> {
    return await this.taskRepository.findByUserId(userId);
  }

  async getTaskById(id: number, userId: number): Promise<Task | null> {
    return await this.taskRepository.findByIdAndUserId(id, userId);
  }

  async createTask(userId: number, taskData: CreateTaskRequest): Promise<Task> {
    // バリデーション
    if (!taskData.title || taskData.title.trim().length === 0) {
      throw new Error('タスクタイトルは必須です。');
    }

    if (taskData.title.length > 100) {
      throw new Error('タスクタイトルは100文字以内で入力してください。');
    }

    if (taskData.dueDate) {
      const dueDate = new Date(taskData.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error('有効な完了予定日を入力してください。');
      }
    }

    return await this.taskRepository.create(userId, taskData);
  }

  async updateTask(id: number, userId: number, taskData: UpdateTaskRequest): Promise<Task | null> {
    // タスクの存在確認と権限チェック
    const existingTask = await this.taskRepository.findByIdAndUserId(id, userId);
    if (!existingTask) {
      throw new Error('タスクが見つかりません。');
    }

    // バリデーション
    if (taskData.title !== undefined) {
      if (!taskData.title || taskData.title.trim().length === 0) {
        throw new Error('タスクタイトルは必須です。');
      }
      if (taskData.title.length > 100) {
        throw new Error('タスクタイトルは100文字以内で入力してください。');
      }
    }

    if (taskData.progress !== undefined) {
      if (taskData.progress < 0 || taskData.progress > 100) {
        throw new Error('進捗は0から100の間で入力してください。');
      }
    }

    if (taskData.status !== undefined) {
      if (![0, 1, 2].includes(taskData.status)) {
        throw new Error('無効なステータスです。');
      }
    }

    if (taskData.dueDate) {
      const dueDate = new Date(taskData.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error('有効な完了予定日を入力してください。');
      }
    }

    return await this.taskRepository.update(id, taskData);
  }

  async deleteTask(id: number, userId: number): Promise<boolean> {
    // タスクの存在確認と権限チェック
    const existingTask = await this.taskRepository.findByIdAndUserId(id, userId);
    if (!existingTask) {
      throw new Error('タスクが見つかりません。');
    }

    return await this.taskRepository.delete(id);
  }
}