import client from './client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  is_active: boolean;
  created_at: string;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await client.post<AuthResponse>('/api/auth/token', formData);
    return response.data;
  },
  
  signup: async (credentials: SignupCredentials): Promise<User> => {
    const response = await client.post<User>('/api/auth/signup', credentials);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await client.get<User>('/api/auth/me');
    return response.data;
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  
  removeToken: (): void => {
    localStorage.removeItem('token');
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};

export default authService;