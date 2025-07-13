export interface Task {
  id: number;
  userId: number;
  title: string;
  progres: number;
  status: TaskStatus;
  dueDate: Date | null,
  notes: string | null;
  completionCriteria: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  PENDING = 0,
  COMPLETED = 1,
  DELETED = 2
}

export interface CreateTaskRequest {
  title: string;
  dueDate?: string;
  notes?: string;
  completionCriteria?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  progress?: number;
  status?: TaskStatus;
  dueDate?: string;
  notes?: string;
  completionCriteria?: string;
}