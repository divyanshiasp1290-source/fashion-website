import React, { createContext, useContext, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { DbCustomer } from "../types/database";

export type AuthUser = {
  id: string;
  email: string;
  role: "admin" | "customer";
  full_name?: string;
  phone?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
    role?: "admin" | "customer"
  ) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  quickDemoLogin: (role: "admin" | "customer") => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = "mm_mock_auth_session";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch customer profile from customers table
            const { data: customer } = await supabase
              .from("customers")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle();

            let role = (customer?.role as "admin" | "customer") || (session.user.user_metadata?.role as "admin" | "customer") || "customer";

            if (role !== "admin" && (session.user.email?.toLowerCase().includes("admin") || session.user.email?.toLowerCase() === "divyanshiasp1290@gmail.com")) {
              role = "admin";
            }

            setUser({
              id: session.user.id,
              email: session.user.email || "",
              role,
              full_name: customer?.full_name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
              phone: customer?.phone || "",
            });
          } else {
            // Check for persistent dev override session
            const saved = localStorage.getItem(LOCAL_AUTH_KEY);
            if (saved) {
              setUser(JSON.parse(saved));
            }
          }
        } catch (e) {
          console.warn("Error fetching Supabase session:", e);
        }
      } else {
        // Mock mode session recovery
        try {
          const saved = localStorage.getItem(LOCAL_AUTH_KEY);
          if (saved) {
            setUser(JSON.parse(saved));
          }
        } catch {}
      }
      setIsLoading(false);
    }

    checkSession();

    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: customer } = await supabase
            .from("customers")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          let role = (customer?.role as "admin" | "customer") || (session.user.user_metadata?.role as "admin" | "customer") || "customer";

          if (role !== "admin" && (session.user.email?.toLowerCase().includes("admin") || session.user.email?.toLowerCase() === "divyanshiasp1290@gmail.com")) {
            role = "admin";
          }

          setUser({
            id: session.user.id,
            email: session.user.email || "",
            role,
            full_name: customer?.full_name || session.user.user_metadata?.full_name,
            phone: customer?.phone || "",
          });
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };

        if (data.user) {
          const { data: customer } = await supabase
            .from("customers")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

          let role = (customer?.role as "admin" | "customer") || (data.user.user_metadata?.role as "admin" | "customer") || "customer";

          // Auto-promote if no admins exist or if email matches admin identifier
          if (role !== "admin") {
            const { count } = await supabase
              .from("customers")
              .select("*", { count: "exact", head: true })
              .eq("role", "admin");

            if (count === 0 || email.toLowerCase().includes("admin") || email.toLowerCase() === "divyanshiasp1290@gmail.com") {
              await supabase.from("customers").upsert({
                id: data.user.id,
                email: data.user.email || email,
                role: "admin",
                full_name: customer?.full_name || data.user.user_metadata?.full_name || "Atelier Director",
              });
              role = "admin";
            }
          }

          const loggedUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || "",
            role,
            full_name: customer?.full_name || data.user.user_metadata?.full_name,
          };
          setUser(loggedUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(loggedUser));
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Authentication failed" };
      }
    } else {
      // Mock login: if email includes "admin", grant admin role
      const isAdmin = email.toLowerCase().includes("admin");
      const mockUser: AuthUser = {
        id: `usr-${Date.now()}`,
        email,
        role: isAdmin ? "admin" : "customer",
        full_name: isAdmin ? "Atelier Director" : email.split("@")[0],
      };
      setUser(mockUser);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(mockUser));
      return { success: true };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    role: "admin" | "customer" = "customer"
  ): Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || (role === "admin" ? "Atelier Director" : undefined),
              role: role,
            },
          },
        });
        if (error) return { success: false, error: error.message };

        if (data.user) {
          if (data.session) {
            // Auto confirmed or immediate session
            await supabase.from("customers").upsert({
              id: data.user.id,
              email: data.user.email || email,
              full_name: fullName || (role === "admin" ? "Atelier Director" : undefined),
              role: role,
            });
            const newUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || email,
              role: role,
              full_name: fullName || (role === "admin" ? "Atelier Director" : undefined),
            };
            setUser(newUser);
            localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newUser));
            return { success: true };
          } else {
            // User registered, but email confirmation is active in Supabase project
            return {
              success: true,
              needsEmailConfirmation: true,
              error: `Account created in Supabase! A verification email has been sent to ${email}. Please check your inbox to confirm, or turn off "Confirm email" in Supabase Authentication -> Providers -> Email for instant logins.`,
            };
          }
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Registration failed" };
      }
    } else {
      const mockUser: AuthUser = {
        id: `usr-${Date.now()}`,
        email,
        role,
        full_name: fullName || email.split("@")[0],
      };
      setUser(mockUser);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(mockUser));
      return { success: true };
    }
  };

  const logout = async (): Promise<void> => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Supabase sign out error:", e);
      }
    }
    setUser(null);
    localStorage.removeItem(LOCAL_AUTH_KEY);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to send reset email" };
      }
    } else {
      return { success: true };
    }
  };

  const quickDemoLogin = (role: "admin" | "customer") => {
    const demoUser: AuthUser = {
      id: role === "admin" ? "admin-demo-id" : "customer-demo-id",
      email: role === "admin" ? "admin@maisonmakeeva.com" : "collector@archiveluxury.com",
      role,
      full_name: role === "admin" ? "Atelier Director" : "Archival Collector",
    };
    setUser(demoUser);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(demoUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        signUp,
        logout,
        resetPassword,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
