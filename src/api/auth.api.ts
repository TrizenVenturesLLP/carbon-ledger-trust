import apiClient from './client';

export interface RegisterData {
  email: string;
  password: string;
  role: 'company' | 'regulator';
  companyName?: string;
  walletAddress?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: 'company' | 'regulator' | 'admin';
  companyName?: string;
  walletAddress?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  linkWallet: async (walletAddress: string): Promise<User> => {
    const response = await apiClient.post<User>('/auth/link-wallet', { walletAddress });
    return response.data;
  },

  unlinkWallet: async (): Promise<User> => {
    const response = await apiClient.post<User>('/auth/unlink-wallet');
    return response.data;
  },
};
