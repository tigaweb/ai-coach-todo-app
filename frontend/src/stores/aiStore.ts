import { create } from 'zustand';
import { AIComment } from '../types';
import { apiService } from "../services/api";

interface AIState {
  comments: AIComment[];
  currentComment: AIComment | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  consultTask: (taskId: number, userInput: string) => Promise<AIComment>;
  fetchTaskComments: (taskId: number) => Promise<void>;
  setCurrentComment: (comment: AIComment | null) => void;
  clearError: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  comments: [],
  currentComment: null,
  isLoading: false,
  error: null,

  consultTask: async (taskId: number, userInput: string) => {
    set({ isLoading: true, error: null });
    try {
      const aiComment = await apiService.consultTask(taskId, userInput);
      set(state => ({
        comments: [aiComment, ...state.comments],
        isLoading: false
      }));
      return aiComment;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'AI相談に失敗しました',
        isLoading: false
      });
      throw error;
    }
  },

  fetchTaskComments: async (taskId: number) => {
    set({ isLoading: true, error: null });
    try {
      const comments = await apiService.getTaskComments(taskId);
      set({ comments, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'コメントの取得に失敗しました',
        isLoading: false
      });
    }
  },

  setCurrentComment: (comment: AIComment | null) => set({ currentComment: comment }),

  clearError: () => set({ error: null }),
})); 