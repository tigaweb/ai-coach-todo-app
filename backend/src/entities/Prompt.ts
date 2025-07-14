export interface Prompt {
  id: number;
  name: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromptRequest {
  name: string;
  content: string;
}

export interface UpdatePromptRequest {
  name?: string;
  content?: string;
  isActive?: boolean;
} 