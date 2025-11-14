// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  profilePicture?: string;
}

export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: string;
  dueDate?: string;
  dueTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: string;
  dueDate?: string;
  dueTime?: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// Helper function to get headers
const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// API Client Class
class ApiClient {
  // ==================== AUTH ENDPOINTS ====================
  
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ username, email, password }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }
    
    const data = await response.json();
    // Store token in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  }
  
  async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ emailOrUsername, password }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Login failed');
    }
    
    const data = await response.json();
    // Store token in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  }
  
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
  
  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  // ==================== USER ENDPOINTS ====================
  
  async getUserProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return response.json();
  }
  
  async updateProfile(username?: string, email?: string): Promise<User> {
    const params = new URLSearchParams();
    if (username) params.append('username', username);
    if (email) params.append('email', email);
    
    const response = await fetch(`${API_BASE_URL}/users/profile?${params}`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update profile');
    }
    
    return response.json();
  }
  
  async uploadProfilePicture(file: File): Promise<{ profilePicture: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to upload profile picture');
    }
    
    const data = await response.json();
    
    // Update user in localStorage
    const user = this.getCurrentUser();
    if (user) {
      user.profilePicture = data.profilePicture;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return data;
  }
  
  async deleteProfilePicture(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/profile-picture`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete profile picture');
    }
    
    // Update user in localStorage
    const user = this.getCurrentUser();
    if (user) {
      user.profilePicture = undefined;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
  
  // ==================== TODO ENDPOINTS ====================
  
  async getAllTodos(): Promise<Todo[]> {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    
    return response.json();
  }
  
  async getTodosByDate(date: string): Promise<Todo[]> {
    const response = await fetch(`${API_BASE_URL}/todos/by-date?date=${date}`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch todos by date');
    }
    
    return response.json();
  }
  
  async getTodoStatistics(): Promise<TodoStatistics> {
    const response = await fetch(`${API_BASE_URL}/todos/statistics`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch todo statistics');
    }
    
    return response.json();
  }
  
  async getTodosByPriority(priority: 'LOW' | 'MEDIUM' | 'HIGH'): Promise<Todo[]> {
    const response = await fetch(`${API_BASE_URL}/todos/by-priority?priority=${priority}`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch todos by priority');
    }
    
    return response.json();
  }
  
  async getTodosByCategory(category: string): Promise<Todo[]> {
    const response = await fetch(`${API_BASE_URL}/todos/by-category?category=${category}`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch todos by category');
    }
    
    return response.json();
  }
  
  async getTodoById(id: number): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch todo');
    }
    
    return response.json();
  }
  
  async createTodo(todo: CreateTodoRequest): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(todo),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create todo');
    }
    
    return response.json();
  }
  
  async updateTodo(id: number, todo: CreateTodoRequest): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(todo),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update todo');
    }
    
    return response.json();
  }
  
  async toggleTodoCompletion(id: number): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle todo completion');
    }
    
    return response.json();
  }
  
  async deleteTodo(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
  }
}

// Export a singleton instance
const api = new ApiClient();
export default api;