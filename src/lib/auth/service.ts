/**
 * Authentication service for frontend
 * Handles API calls to backend auth endpoints
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7777";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified: boolean;
}

export interface AuthSession {
  session_id: string;
  token: string;
  expires_at: string;
}

export interface AuthResponse {
  user: User;
  session: AuthSession;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      // Also set as cookie for middleware
      document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    }
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      // Clear cookie
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Sign up failed");
    }

    const result: AuthResponse = await response.json();
    this.setToken(result.session.token);
    
    // Store user data
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(result.user));
    }

    return result;
  }

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Sign in failed");
    }

    const result: AuthResponse = await response.json();
    this.setToken(result.session.token);
    
    // Store user data
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(result.user));
    }

    return result;
  }

  async signOut(): Promise<void> {
    const token = this.getToken();
    
    if (token) {
      try {
        await fetch(`${API_URL}/auth/signout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Sign out error:", error);
      }
    }

    this.clearToken();
  }

  async getSession(): Promise<User | null> {
    const token = this.getToken();
    
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/auth/session`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.clearToken();
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Get session error:", error);
      this.clearToken();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  getStoredUser(): User | null {
    if (typeof window === "undefined") {
      return null;
    }

    const userStr = localStorage.getItem("auth_user");
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
