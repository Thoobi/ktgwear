import { supabase } from "../../lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createContext, useEffect, useState, type ReactNode } from "react";
import type { registerData, loginData } from "../../types/auth";
import { toast } from "sonner";
import { supabaseAuthError } from "../../lib/supabaseErrors";
import type {
  AuthContextProps,
  AppUser,
  SupabaseUserMetadata,
} from "./auth_context_core";
import {
  signupSchema,
  loginSchema,
  // adminSchema,
  forgotPasswordSchema,
  zodErrorsToFieldMap,
} from "../../schemas/auth";

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const mapSupabaseUser = (supUser: SupabaseUser | null): AppUser | null => {
  if (!supUser || !supUser.email) return null;
  const meta = supUser.user_metadata as SupabaseUserMetadata | undefined;
  return {
    id: supUser.id,
    email: supUser.email,
    name: meta?.full_name ?? undefined,
    displayName: meta?.display_name ?? undefined,
  };
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  // don't use useNavigate here (provider may mount before Router); use window.location instead
  const [isLoginLoading, setisLoginLoading] = useState(false);
  const [isSignupLoading, setisSignupLoading] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserDataLoading, setIsUserDataLoading] = useState(false);
  const [userID, setUserID] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user: supUser },
        } = await supabase.auth.getUser();

        if (!supUser || !supUser.email) {
          setUser(null);
          setIsAuthenticated(false);
        } else {
          setUser(mapSupabaseUser(supUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(mapSupabaseUser(session?.user ?? null));
        setIsAuthenticated(!!session?.user);
        setisLoginLoading(false);
        setisSignupLoading(false);
      }
    );

    // Initial check for session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(mapSupabaseUser(session?.user ?? null));
      setIsAuthenticated(!!session?.user);
      setIsLoading(false);
    };
    getSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignup = async ({ email, password, username }: registerData) => {
    const parsed = signupSchema.safeParse({ email, password, username });
    if (!parsed.success) {
      const validationErrors = zodErrorsToFieldMap(parsed.error);
      return { data: null, error: parsed.error, validationErrors };
    }
    setisSignupLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: username } },
      });
      if (error) {
        toast.error(
          supabaseAuthError(error, "Invalid credentials or signup failed")
        );
        return { data: null, error };
      }
      if (data?.user) {
        setUser(mapSupabaseUser(data.user));
        setIsAuthenticated(false);
      }
      // signup succeeded; UI components should handle user-facing toasts/redirects
      return { data, error: null };
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(supabaseAuthError(error, "Signup failed"));
      return { data: null, error };
    } finally {
      setisSignupLoading(false);
    }
  };

  const handleLogin = async ({ email, password }: loginData) => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const validationErrors = zodErrorsToFieldMap(parsed.error);
      return { data: null, error: parsed.error, validationErrors };
    }
    setisLoginLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        // show a toast for invalid credentials or other auth errors
        toast.error(supabaseAuthError(error, "Invalid credentials"));
        return { data: null, error };
      }
      setUser(mapSupabaseUser(data.user ?? null));
      setIsAuthenticated(!!data.user);
      toast.success("Login successful!", {
        onAutoClose: () => {
          if (data?.user) {
            window.location.assign("/user/dashboard");
          }
        },
      });
      return { data, error: null };
    } catch (error) {
      console.error("Login error:", error);
      toast.error(supabaseAuthError(error, "Login failed"));
      return { data: null, error };
    } finally {
      setisLoginLoading(false);
    }
  };

  // const handleAdminSignup = async (email: string, password: string) => {
  //   const parsedAdmin = adminSchema.safeParse({ email, password });
  //   if (!parsedAdmin.success) {
  //     const validationErrors = zodErrorsToFieldMap(parsedAdmin.error);
  //     return { data: null, error: parsedAdmin.error, validationErrors };
  //   }
  //   setisSignupLoading(true);
  //   try {
  //     const { data, error } = await adminAuthClient.createUser({
  //       email,
  //       password,
  //       email_confirm: true,
  //       user_metadata: { display_name: "KTG", role: "admin" },
  //     });
  //     if (error) return { data: null, error };
  //     if (data.user) {
  //       const { error: profileError } = await supabaseAdmin
  //         .from("profiles")
  //         .upsert({ id: data.user.id, role: "admin" });
  //       if (profileError) throw profileError;
  //     }
  //     toast.success("Admin account created successfully!");
  //     return { data, error: null };
  //   } catch (error) {
  //     console.error("Admin signup error:", error);
  //     return { data: null, error };
  //   } finally {
  //     setisSignupLoading(false);
  //   }
  // };

  const handleForgotPassword = async (email: string) => {
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      const validationErrors = zodErrorsToFieldMap(parsed.error);
      return { data: null, error: parsed.error, validationErrors };
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account/reset`,
      });
      if (error) return { data: null, error };
      toast.success("Password reset email sent");
      return { data, error: null };
    } catch (error) {
      console.error("Forgot password error:", error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  // const handleAdminLogin = async (email: string, password: string) => {
  //   setIsLoading(true);
  //   try {
  //     const { data, error } = await supabase.auth.signInWithPassword({
  //       email,
  //       password,
  //     });
  //     if (error) throw error;
  //     const { data: profileData, error: profileError } = await supabaseAdmin
  //       .from("profiles")
  //       .select("role")
  //       .eq("id", data.user.id)
  //       .single();
  //     if (profileError) throw profileError;
  //     if (profileData.role !== "admin") {
  //       await supabase.auth.signOut();
  //       throw new Error("Unauthorized: Not an admin user");
  //     }
  //     setIsAdminAuthenticated(true);
  //     toast.success("Admin login successful");
  //     window.location.assign("/admin/dashboard");
  //     // redirect to admin login page
  //     window.location.assign(`${window.location.origin}/admin/login`);
  //     return { data, error: null };
  //   } catch (error) {
  //     console.error("Admin login error:", error);
  //     // normalize Supabase error messages
  //     toast.error(
  //       supabaseAuthError(error, "You are not authorized to access this area")
  //     );
  //     return { data: null, error };
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { error };
      setUser(null);
      setIsAuthenticated(false);
      toast.success("Logged out successfully", {
        duration: 1500,
        onAutoClose: () =>
          window.location.assign(`${window.location.origin}/account/login`),
      });
      return { error: null };
    } catch (error) {
      console.error("Logout error:", error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { error };
      setIsAdminAuthenticated(false);
      toast.success("Admin logged out successfully", {
        onAutoClose: () =>
          window.location.assign(`${window.location.origin}/admin/login`),
      });
      return { error: null };
    } catch (error: unknown) {
      console.error("Admin logout error:", error);
      toast.error(supabaseAuthError(error, "Error logging out"));
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const getUser = async () => {
    try {
      setIsUserDataLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setIsUserDataLoading(false);
        setUserID(user.id);
      } else {
        setIsUserDataLoading(false);
      }
      return user;
    } catch (error) {
      setIsUserDataLoading(false);
      console.error("Error getting user:", error);
      return null;
    }
  };

  const value: AuthContextProps = {
    handleSignup,
    handleLogin,
    handleLogout,
    isSignupLoading,
    setisSignupLoading,
    isLoginLoading,
    setisLoginLoading,
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    isLoading,
    getUser,
    // handleAdminSignup,
    // handleAdminLogin,
    handleForgotPassword,
    isAdminAuthenticated,
    handleAdminLogout,
    setIsUserDataLoading,
    isUserDataLoading,
    userID,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
export default AuthProvider;
