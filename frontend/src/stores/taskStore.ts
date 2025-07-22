import { create } from "zustand";
import { Task } from "../types";
import { apiService } from "../services/api";


interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  setCurrentTask: (task: Task | null) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const response = await apiService.getTasks();
      set({ tasks: response.tasks, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createTask: async (taskData: Partial<Task>) => {
    set({ isLoading: true });
    try {
      const newTask = await apiService.createTask(taskData);
      set(state => ({
        tasks: [...state.tasks, newTask],
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateTask: async (id: number, updates: Partial<Task>) => {
    set({ isLoading: true });
    try {
      const updatedTask = await apiService.updateTask(id, updates);
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? updatedTask : task
        ),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteTask: async (id: number) => {
    set({ isLoading: true });
    try {
      await apiService.deleteTask(id);
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setCurrentTask: (task: Task | null) => {
    set({ currentTask: task });
  },
}));