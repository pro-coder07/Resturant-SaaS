import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: !!accessToken }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },

      hydrate: (state) => {
        const storedToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedToken) {
          set({
            accessToken: storedToken,
            refreshToken: storedRefreshToken,
            isAuthenticated: true,
          });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
