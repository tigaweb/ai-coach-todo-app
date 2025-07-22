import { create } from "zustand";
import { User } from "../types";
import { apiService } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";


interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiService.login(email, password);
      await AsyncStorage.setItem('authToken', response.token);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    set({ user: null, isAuthenticated: false });
  },

  initialize: async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      set({ isAuthenticated: true });
    }
  },
}));