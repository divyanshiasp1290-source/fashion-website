import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project") &&
    supabaseAnonKey !== "your-anon-key-here" &&
    supabaseAnonKey.length > 20
  );
};

export type DatabaseStatus = {
  isConfigured: boolean;
  mode: "supabase" | "mock";
  label: string;
  projectUrl: string;
};

export const getDatabaseStatus = (): DatabaseStatus => {
  const configured = isSupabaseConfigured();
  return {
    isConfigured: configured,
    mode: configured ? "supabase" : "mock",
    label: configured ? "Supabase Live (Real-Time)" : "Preview Mode (Mock Storage)",
    projectUrl: configured ? supabaseUrl : "Development Preview",
  };
};

// Create client with fallback placeholder to prevent initialization crash when env is absent
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : "https://placeholder-atelier.supabase.co",
  isSupabaseConfigured() ? supabaseAnonKey : "placeholder-anon-key-atelier-preview-mode",
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
