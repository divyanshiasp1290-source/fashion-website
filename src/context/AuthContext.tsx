import React, { createContext, useContext, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { mockStorage } from "../services/mockStorage";
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: "admin" | "customer" }>;
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
const MM_CLIENT_REGISTRY_KEY = "mm_client_registered_users";

type RegisteredClientRecord = {
  id: string;
  email: string;
  password?: string;
  fullName?: string;
  createdAt: string;
};

function getLocalClientRegistry(): Record<string, RegisteredClientRecord> {
  try {
    const raw = localStorage.getItem(MM_CLIENT_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalClientRecord(rec: RegisteredClientRecord) {
  try {
    const reg = getLocalClientRegistry();
    reg[rec.email.toLowerCase()] = rec;
    localStorage.setItem(MM_CLIENT_REGISTRY_KEY, JSON.stringify(reg));
  } catch {}
}

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

            // If divyanshiasp1290 had been set to admin erroneously, revert to customer
            if (session.user.email?.toLowerCase() === "divyanshiasp1290@gmail.com" && role === "admin") {
              role = "customer";
              supabase.from("customers").update({ role: "customer" }).eq("id", session.user.id).then();
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
              const parsed = JSON.parse(saved);
              if (parsed?.email?.toLowerCase() === "divyanshiasp1290@gmail.com" && parsed?.role === "admin") {
                parsed.role = "customer";
                localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(parsed));
              }
              if (parsed?.email?.toLowerCase() === "admin@maisonmakeeva.com") {
                parsed.role = "admin";
                localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(parsed));
              }
              setUser(parsed);
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
            const parsed = JSON.parse(saved);
            if (parsed?.email?.toLowerCase() === "divyanshiasp1290@gmail.com" && parsed?.role === "admin") {
              parsed.role = "customer";
              localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(parsed));
            }
            if (parsed?.email?.toLowerCase() === "admin@maisonmakeeva.com") {
              parsed.role = "admin";
              localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(parsed));
            }
            setUser(parsed);
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

          if (session.user.email?.toLowerCase() === "divyanshiasp1290@gmail.com" && role === "admin") {
            role = "customer";
            supabase.from("customers").update({ role: "customer" }).eq("id", session.user.id).then();
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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: "admin" | "customer" }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Dedicated Atelier Director Master Admin Authentication
    if (cleanEmail === "admin@maisonmakeeva.com") {
      if (password === "_Admin@1290") {
        const adminUser: AuthUser = {
          id: "admin-atelier-dir",
          email: "admin@maisonmakeeva.com",
          role: "admin",
          full_name: "Atelier Director",
        };
        setUser(adminUser);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(adminUser));
        return { success: true, role: "admin" };
      } else {
        return {
          success: false,
          error: "Invalid administrative credentials.",
        };
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });

        if (!error && data?.user) {
          const { data: customer } = await supabase
            .from("customers")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

          let role = (customer?.role as "admin" | "customer") || (data.user.user_metadata?.role as "admin" | "customer") || "customer";

          // If divyanshiasp1290 was previously marked as admin, revert to customer
          if (cleanEmail === "divyanshiasp1290@gmail.com" && role === "admin") {
            role = "customer";
            await supabase.from("customers").update({ role: "customer" }).eq("id", data.user.id);
          }

          const loggedUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            role,
            full_name: customer?.full_name || data.user.user_metadata?.full_name || cleanEmail.split("@")[0],
          };
          setUser(loggedUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(loggedUser));
          return { success: true, role: loggedUser.role };
        }

        // Supabase sign in failed (e.g. Email not confirmed, or credentials issue)
        // Check local client registry
        const localRegistry = getLocalClientRegistry();
        const localRecord = localRegistry[cleanEmail];
        const mockList = mockStorage.getCustomers();
        const mockRecord = mockList.find((c) => c.email.toLowerCase() === cleanEmail);

        if (localRecord && (!localRecord.password || localRecord.password === password)) {
          const clientUser: AuthUser = {
            id: localRecord.id,
            email: cleanEmail,
            role: "customer",
            full_name: localRecord.fullName || cleanEmail.split("@")[0],
          };
          setUser(clientUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(clientUser));
          return { success: true, role: "customer" };
        }

        // Check if customer is registered in mockStorage or Supabase customers table
        if (mockRecord) {
          const clientUser: AuthUser = {
            id: mockRecord.id,
            email: cleanEmail,
            role: "customer",
            full_name: mockRecord.full_name || cleanEmail.split("@")[0],
          };
          setUser(clientUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(clientUser));
          return { success: true, role: "customer" };
        }

        // If Supabase failed because email confirmation is required, let client in immediately
        if (error && error.message.toLowerCase().includes("email not confirmed")) {
          const clientUser: AuthUser = {
            id: `cust-${Date.now()}`,
            email: cleanEmail,
            role: "customer",
            full_name: cleanEmail.split("@")[0],
          };
          setUser(clientUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(clientUser));
          return { success: true, role: "customer" };
        }

        return {
          success: false,
          error: error?.message || "Invalid login credentials. Click 'New Client? Register' to create your account.",
        };
      } catch (err: any) {
        const localRegistry = getLocalClientRegistry();
        const localRecord = localRegistry[cleanEmail];
        if (localRecord && (!localRecord.password || localRecord.password === password)) {
          const clientUser: AuthUser = {
            id: localRecord.id,
            email: cleanEmail,
            role: "customer",
            full_name: localRecord.fullName || cleanEmail.split("@")[0],
          };
          setUser(clientUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(clientUser));
          return { success: true, role: "customer" };
        }
        return { success: false, error: err.message || "Authentication failed" };
      }
    } else {
      // Mock mode
      const localRegistry = getLocalClientRegistry();
      const localRecord = localRegistry[cleanEmail];
      const list = mockStorage.getCustomers();
      const existing = list.find((c) => c.email.toLowerCase() === cleanEmail);

      const clientUser: AuthUser = {
        id: localRecord?.id || existing?.id || `usr-${Date.now()}`,
        email: cleanEmail,
        role: "customer",
        full_name: localRecord?.fullName || existing?.full_name || cleanEmail.split("@")[0],
      };
      setUser(clientUser);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(clientUser));
      return { success: true, role: "customer" };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    role: "admin" | "customer" = "customer"
  ): Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const effectiveName = fullName?.trim() || cleanEmail.split("@")[0];
    const localId = `cust-${Date.now()}`;

    // Prevent registering administrative identity as a normal client
    if (cleanEmail === "admin@maisonmakeeva.com") {
      return {
        success: false,
        error: "This address is reserved exclusively for Atelier Administration and cannot be registered as a client account.",
      };
    }

    // Always register in local client registry and mock storage immediately
    saveLocalClientRecord({
      id: localId,
      email: cleanEmail,
      password: password,
      fullName: effectiveName,
      createdAt: new Date().toISOString(),
    });

    mockStorage.createOrUpdateCustomer({
      id: localId,
      email: cleanEmail,
      full_name: effectiveName,
      role: role,
      status: "active",
      created_at: new Date().toISOString(),
    });

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: effectiveName,
              role: role,
            },
          },
        });

        const userId = data?.user?.id || localId;

        // Upsert into Supabase customers table
        try {
          await supabase.from("customers").upsert({
            id: userId,
            email: cleanEmail,
            full_name: effectiveName,
            role: role,
          });
        } catch (e) {
          console.warn("Supabase customers upsert note:", e);
        }

        // Establish client session immediately so registration NEVER leaves user stranded
        const newUser: AuthUser = {
          id: userId,
          email: cleanEmail,
          role: role,
          full_name: effectiveName,
        };
        setUser(newUser);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newUser));
        return { success: true };
      } catch (err: any) {
        // Even if Supabase throws an error (e.g. rate limit or already registered),
        // we establish the client session with local record
        const newUser: AuthUser = {
          id: localId,
          email: cleanEmail,
          role: role,
          full_name: effectiveName,
        };
        setUser(newUser);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newUser));
        return { success: true };
      }
    } else {
      const mockUser: AuthUser = {
        id: localId,
        email: cleanEmail,
        role,
        full_name: effectiveName,
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
