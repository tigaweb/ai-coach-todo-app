export interface User {
  id: number;
  email: string;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  progress: number;
  status: TaskStatus;
  dueDate: string | null;
  notes: string | null;
  completionCriteria: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum TaskStatus {
  PENDING = 0,
  COMPLETED = 1,
  DELETED = 2
}

export interface AIComment {
  id: number;
  taskId: number;
  userInput: string;
  aiResponse: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TasksResponse {
  tasks: Task[];
}

export interface AICommentResponse {
  aiComment: AIComment;
}