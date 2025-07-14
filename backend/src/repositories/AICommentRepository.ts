import { PrismaClient } from "../../generated/prisma";
import { AIComment } from "../entities/AIComment";

export interface IAICommentRepository {
  findByTaskId(taskId: number): Promise<AIComment[]>;
  findById(id: number): Promise<AIComment | null>;
  create(taskId: number, userInput: string, aiResponse: string): Promise<AIComment>;
}


export class AICommentRepository implements IAICommentRepository {
  constructor(private prisma: PrismaClient) {}

  async findByTaskId(taskId: number): Promise<AIComment[]> {
    const comments = await this.prisma.aiComment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' }
    });
    return comments;
  }

  async findById(id: number): Promise<AIComment | null> {
    const comment = await this.prisma.aiComment.findUnique({
      where: { id }
    });
    return comment;
  }

  async create(taskId: number, userInput: string, aiResponse: string): Promise<AIComment> {
    const comment = await this.prisma.aiComment.create({
      data: {
        taskId,
        userInput,
        aiResponse
      }
    });
    return comment;
  }
} 