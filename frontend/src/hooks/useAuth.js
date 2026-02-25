import { useAuthStore } from '../context/authStore.js';
import { authAPI } from '../services/apiEndpoints.js';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore();

  const login = async (email, password, isStaff = false) => {
    try {
      authStore.setLoading(true);
      const response = isStaff
        ? await authAPI.staffLogin(email, password)
        : await authAPI.login(email, password);

      const { accessToken, refreshToken, restaurant, user } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      authStore.setTokens(accessToken, refreshToken);
      authStore.setUser(restaurant || user);
      authStore.setError(null);

      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      authStore.setError(errorMessage);
      return false;
    } finally {
      authStore.setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      authStore.setLoading(true);
      const response = await authAPI.register(data);

      const { accessToken, refreshToken, restaurant } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      authStore.setTokens(accessToken, refreshToken);
      authStore.setUser(restaurant);
      authStore.setError(null);

      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      authStore.setError(errorMessage);
      return false;
    } finally {
      authStore.setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authStore.logout();
      navigate('/login');
    }
  };

  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    login,
    register,
    logout,
  };
};
