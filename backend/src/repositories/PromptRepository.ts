import { Prompt, CreatePromptRequest, UpdatePromptRequest } from '../entities/Prompt';

export interface IPromptRepository {
  findAll(): Promise<Prompt[]>;
  findActive(): Promise<Prompt[]>;
  findById(id: number): Promise<Prompt | null>;
  create(promptData: CreatePromptRequest): Promise<Prompt>;
  update(id: number, promptData: UpdatePromptRequest): Promise<Prompt | null>;
  delete(id: number): Promise<boolean>;
}

import { PrismaClient } from '../../generated/prisma';

export class PromptRepository implements IPromptRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Prompt[]> {
    const prompts = await this.prisma.prompt.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return prompts;
  }

  async findActive(): Promise<Prompt[]> {
    const prompts = await this.prisma.prompt.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    return prompts;
  }

  async findById(id: number): Promise<Prompt | null> {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id }
    });
    return prompt;
  }

  async create(promptData: CreatePromptRequest): Promise<Prompt> {
    const prompt = await this.prisma.prompt.create({
      data: {
        name: promptData.name,
        content: promptData.content
      }
    });
    return prompt;
  }

  async update(id: number, promptData: UpdatePromptRequest): Promise<Prompt | null> {
    try {
      const prompt = await this.prisma.prompt.update({
        where: { id },
        data: {
          ...(promptData.name && { name: promptData.name }),
          ...(promptData.content && { content: promptData.content }),
          ...(promptData.isActive !== undefined && { isActive: promptData.isActive })
        }
      });
      return prompt;
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.prompt.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }
} 