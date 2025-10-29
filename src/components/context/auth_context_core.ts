import type { User as SupabaseUser } from "@supabase/supabase-js";
import React from "react";
import type { registerData, loginData } from "../../types/auth";

export interface AppUser {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
}

export interface SupabaseUserMetadata {
  full_name?: string;
  display_name?: string;
}

export type AuthResponse<T = unknown> = {
  data: T | null;
  error: unknown | null;
  validationErrors?: Record<string, string> | null;
};

export interface AuthContextProps {
  handleSignup: (data: registerData) => Promise<AuthResponse>;
  handleLogin: (data: loginData) => Promise<AuthResponse>;
  handleLogout: () => Promise<{ error: unknown | null }>;
  isSignupLoading: boolean;
  setisSignupLoading: (loading: boolean) => void;
  isLoginLoading: boolean;
  setisLoginLoading: (loading: boolean) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  user: AppUser | null;
  setUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
  isLoading: boolean;
  getUser: () => Promise<SupabaseUser | null>;
  // handleAdminSignup: (email: string, password: string) => Promise<AuthResponse>;
  // handleAdminLogin: (email: string, password: string) => Promise<AuthResponse>;
  isAdminAuthenticated: boolean;
  handleAdminLogout: () => Promise<{ error: unknown | null }>;
  handleForgotPassword: (email: string) => Promise<AuthResponse>;
  isUserDataLoading: boolean;
  setIsUserDataLoading: (loading: boolean) => void;
  userID: string | null;
}

export {};
