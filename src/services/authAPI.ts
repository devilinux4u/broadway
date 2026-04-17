import { apiCall } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    is_active: boolean;
  };
  expires_at: number;
}

export interface SignupResponse {
  token: string;
  user: {
    id: string;
    email: string;
    is_active: boolean;
  };
  expires_at: number;
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
  token?: string;
}

export interface ResetPasswordResponse {
  message: string;
}

/**
 * User Authentication API Service
 * Handles login, signup, password reset, and other auth operations
 */

export const userAuthAPI = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Sign up with email and password
   */
  signup: async (email: string, password: string): Promise<SignupResponse> => {
    return apiCall("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    return apiCall("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password with reset token
   */
  resetPassword: async (token: string, password: string): Promise<ResetPasswordResponse> => {
    return apiCall("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<any> => {
    return apiCall("/auth/profile", {
      method: "GET",
    });
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<{ message: string }> => {
    return apiCall("/auth/logout", {
      method: "POST",
    });
  },
};

export default userAuthAPI;
