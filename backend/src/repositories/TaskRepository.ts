import { PrismaClient } from "../../generated/prisma";
import { CreateTaskRequest, Task, TaskStatus, UpdateTaskRequest } from "../entities/Task";


export interface ITaskRepository {
  findByUserId(userId: number): Promise<Task[]>;
  findById(id: number): Promise<Task | null>;
  findByIdAndUserId(id: number, userId: number): Promise<Task | null>;
  create(userId: number, taskData: CreateTaskRequest): Promise<Task>;
  update(id: number, taskData: UpdateTaskRequest): Promise<Task | null>;
  delete(id: number): Promise<boolean>;
}

export class TaskRepository implements ITaskRepository {
  constructor(private prisma: PrismaClient) { }

  async findByUserId(userId: number): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        status: { not: TaskStatus.DELETED }
      },
      orderBy: { createdAt: 'desc' }
    });
    return tasks;
  }

  async findById(id: number): Promise<Task | null> {
    const task = this.prisma.task.findFirst({
      where: {
        id
      }
    });
    return task;
  }

  async findByIdAndUserId(id: number, userId: number): Promise<Task | null> {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        userId,
        status: { not: TaskStatus.DELETED }
      }
    });
    return task;
  }

  async create(userId: number, taskData: CreateTaskRequest): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        userId,
        title: taskData.title,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        notes: taskData.notes,
        completionCriteria: taskData.completionCriteria
      }
    });
    return task;
  }

  async update(id: number, taskData: UpdateTaskRequest): Promise<Task | null> {
    try {
      const task = await this.prisma.task.update({
        where: { id },
        data: {
          ...(taskData.title && { title: taskData.title }),
          ...(taskData.progress !== undefined && { progress: taskData.progress }),
          ...(taskData.status !== undefined && { status: taskData.status }),
          ...(taskData.dueDate && { dueDate: new Date(taskData.dueDate) }),
          ...(taskData.notes !== undefined && { notes: taskData.notes }),
          ...(taskData.completionCriteria !== undefined && { completionCriteria: taskData.completionCriteria })
        }
      });
      return task;
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.task.update({
        where: { id },
        data: { status: TaskStatus.DELETED }
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}