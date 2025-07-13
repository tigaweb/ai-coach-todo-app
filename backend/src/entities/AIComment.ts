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
  taskTitle: string;
  progress: number;
  dueDate: Date | null;
  notes: string | null;
  completionCriteria: string | null;
  systemPrompt: string;
}