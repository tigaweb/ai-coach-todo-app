export interface AIComment {
  id: number;
  taskId: number;
  userInput: string;
  aiResponse: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAICommentRequest {
  userInput: string;
}

export interface AIConsultationRequest {
  taskId: number;
  userInput: string;
  taskContext: TaskContext;
  systemPrompt: string;
}

export interface TaskContext {
  title: string;
  progress: number;
  dueDate?: Date | null;
  completionCriteria?: string | null;
  notes?: string | null;
} 