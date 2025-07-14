import { Context } from "hono";
import { TaskUsecase } from "../usecases/TaskUsecase";
import { CreateTaskRequest, UpdateTaskRequest } from "../entities/Task";

export class TaskController {
  constructor(private taskUsecase: TaskUsecase) { }

  async getAllTasks(c: Context) {
    try {
      const user = c.get('user');
      const tasks = await this.taskUsecase.getAllTasks(user.id);
      return c.json({ tasks });
    } catch (error) {
      console.error('Get ALL Tasks Error:', error);
      return c.json({ error: 'タスクの取得に失敗しました。' });
    }
  }

  async getTaskById(c: Context) {
    try {
      const user = c.get('user');
      const id = parseInt(c.req.param('id'));

      if (isNaN(id)) {
        return c.json({ error: '無効なタスクIDです。' }, 400);
      }

      const task = await this.taskUsecase.getTaskById(id, user.id);

      if (!task) {
        return c.json({ error: 'タスクが見つかりません。' }, 404);
      }

      return c.json({ task });
    } catch (error) {
      console.error('Get Task Error:', error);
      return c.json({ error: error instanceof Error ? error.message : 'タスクの取得に失敗しました。' }, 500);
    }
  }

  async createTask(c: Context) {
    try {
      const user = c.get('user');
      const body = await c.req.json() as CreateTaskRequest;

      const task = await this.taskUsecase.createTask(user.id, body);
      return c.json({ task }, 201);
    } catch (error) {
      console.error('Create Task Error:', error);
      return c.json({ error: error instanceof Error ? error.message : 'タスクの作成に失敗しました。' }, 400);
    }
  }

  async updateTask(c: Context) {
    try {
      const user = c.get('user');
      const id = parseInt(c.req.param('id'));
      const body = await c.req.json() as UpdateTaskRequest;

      if (isNaN(id)) {
        return c.json({ error: '無効なタスクIDです。' }, 400);
      }

      const task = await this.taskUsecase.updateTask(id, user.id, body);

      if (!task) {
        return c.json({ error: 'タスクの更新に失敗しました。' }, 400);
      }

      return c.json({ task });
    } catch (error) {
      console.error('Update Task Error:', error);
      return c.json({ error: error instanceof Error ? error.message : 'タスクの更新に失敗しました。' }, 400);
    }
  }

  async deleteTask(c: Context) {
    try {
      const user = c.get('user');
      const id = parseInt(c.req.param('id'));

      if (isNaN(id)) {
        return c.json({ error: '無効なタスクIDです。' }, 400);
      }

      const success = await this.taskUsecase.deleteTask(id, user.id);

      if (!success) {
        return c.json({ error: 'タスクの削除に失敗しました。' }, 400);
      }

      return c.json({ message: 'タスクが削除されました。' });
    } catch (error) {
      console.error('Delete Task Error:', error);
      return c.json({ error: error instanceof Error ? error.message : 'タスクの削除に失敗しました。' }, 400);
    }
  }
}