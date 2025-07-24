import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { InternalAxiosRequestConfig } from "axios";
import { AIComment, AuthResponse, Task, TaskResponse, TasksResponse } from "../types";

const API_BASE_URL = __DEV__
  ? 'http://192.168.1.167:3000'  // 開発時は実際のIPアドレスに変更
  : 'http://localhost:3000';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // リクエストインターセプター(認証トークン自動追加)
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // レスポンスインターセプター（エラーハンドリング）
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('authToken');
        }
        return Promise.reject(error);
      }
    );
  }

  // 認証API
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  // 全タスク取得API
  async getTasks(): Promise<TasksResponse> {
    const response = await this.client.get<{ tasks: Task[] }>('/api/tasks');
    return response.data;
  }

  async getTask(id: number): Promise<Task> {
    const response = await this.client.get<TaskResponse>(`/api/tasks/${id}`);
    return response.data.task;
  }

  // タスク作成API
  async createTask(task: Partial<Task>): Promise<Task> {
    const response = await this.client.post<{ task: Task }>('/api/tasks', task);
    return response.data.task;
  }

  // タスクの更新
  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const response = await this.client.put<{ task: Task }>(`/api/tasks/${id}`, updates);
    return response.data.task;
  }

  // タスクの削除
  async deleteTask(id: number): Promise<void> {
    await this.client.delete(`/api/tasks/${id}`);
  }

  // AI相談API
  async consultTask(taskId: number, userInput: string): Promise<AIComment> {
    const response = await this.client.post<{ aiComment: AIComment }>(
      `/api/tasks/${taskId}/consult`,
      { userInput },
      { timeout: 90000 } // AI相談は90秒のタイムアウト
    );
    return response.data.aiComment;
  }

  // AIコメント取得API
  async getTaskComments(taskId: number): Promise<AIComment[]> {
    const response = await this.client.get<{ comments: AIComment[] }>(`/api/tasks/${taskId}/comments`);
    return response.data.comments;
  }
}

export const apiService = new ApiService();