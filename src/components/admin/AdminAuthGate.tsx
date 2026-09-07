import { ArrowRight, Check, Lock, ShieldAlert, Sparkles, UserPlus } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { isSupabaseConfigured } from "../../lib/supabase";
import { MaisonMakeevaLogo } from "../MaisonMakeevaLogo";

export const AdminAuthGate: React.FC<{ onBackToStore: () => void }> = ({ onBackToStore }) => {
  const { login, signUp, quickDemoLogin } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("Atelier Director");
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMsg(null);
    setSubmitting(true);

    if (mode === "login") {
      const res = await login(email, password);
      if (!res.success) {
        if (res.error?.toLowerCase().includes("invalid login credentials")) {
          setError(
            "Account not found in Supabase Auth or passcode incorrect. If you haven't registered your Admin account yet, switch to 'Register Admin' below to initialize this account."
          );
        } else {
          setError(res.error || "Invalid administrative credentials.");
        }
      }
    } else {
      const res = await signUp(email, password, fullName, "admin");
      if (!res.success) {
        setError(res.error || "Failed to register administrative user in Supabase.");
      } else if (res.needsEmailConfirmation) {
        setInfoMsg(res.error || "Admin account registered! Please check your email inbox to verify your account.");
      }
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-ink flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-200/90 p-6 sm:p-10 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <MaisonMakeevaLogo className="mx-auto h-12 w-auto text-ink mb-2" />
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-coral font-semibold">
            Maison Makeeva
          </span>
          <h1 className="font-display text-2xl uppercase tracking-wider text-ink font-bold">
            Atelier Administration
          </h1>
          <p className="font-sans text-xs text-gray-500">
            Secure administrative control portal for products, orders, inventory and client dispatches.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 border border-gray-200 p-1 bg-gray-50 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setInfoMsg(null);
            }}
            className={`py-2 text-center uppercase tracking-wider transition ${
              mode === "login"
                ? "bg-ink text-white font-bold shadow-sm"
                : "text-gray-500 hover:text-ink"
            }`}
          >
            Admin Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
              setInfoMsg(null);
            }}
            className={`py-2 text-center uppercase tracking-wider transition ${
              mode === "register"
                ? "bg-ink text-white font-bold shadow-sm"
                : "text-gray-500 hover:text-ink"
            }`}
          >
            Register Admin
          </button>
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 p-3.5 text-red-800 font-mono text-xs space-y-2">
            <div className="flex items-start gap-2">
              <ShieldAlert size={16} className="shrink-0 text-red-600 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
            {mode === "login" && error.includes("switch to 'Register Admin'") && (
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className="block text-ink hover:underline text-[11px] font-bold uppercase tracking-wider pt-1"
              >
                → Click here to Register {email || "this email"} as Admin
              </button>
            )}
          </div>
        )}

        {infoMsg && (
          <div className="flex items-start gap-2 border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-800 font-mono text-xs leading-relaxed">
            <Check size={16} className="shrink-0 text-emerald-600 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-gray-700 font-semibold mb-1">
                Admin Full Name / Title
              </label>
              <input
                required
                type="text"
                placeholder="Atelier Director"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-b border-gray-300 bg-transparent py-2.5 font-mono text-xs text-ink outline-none focus:border-ink placeholder:text-gray-400"
              />
            </div>
          )}

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-gray-700 font-semibold mb-1">
              Admin Identifier / Email
            </label>
            <input
              required
              type="email"
              placeholder="admin@maisonmakeeva.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gray-300 bg-transparent py-2.5 font-mono text-xs text-ink outline-none focus:border-ink placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-gray-700 font-semibold mb-1">
              Secret Passcode
            </label>
            <input
              required
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-300 bg-transparent py-2.5 font-mono text-xs text-ink outline-none focus:border-ink placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink py-3.5 font-mono text-xs uppercase tracking-[0.2em] font-bold text-white hover:bg-gray-800 transition flex items-center justify-center gap-2 mt-4 min-h-[44px] shadow-sm"
          >
            {submitting ? (
              <span>Verifying Authorization...</span>
            ) : mode === "login" ? (
              <>
                <span>Enter Administration</span>
                <ArrowRight size={14} />
              </>
            ) : (
              <>
                <span>Create & Initialize Admin Account</span>
                <UserPlus size={14} />
              </>
            )}
          </button>
        </form>

        {/* Localhost Direct Dev Bypass */}
        <div className="pt-4 border-t border-gray-200 space-y-2 text-center">
          <button
            type="button"
            onClick={() => quickDemoLogin("admin")}
            className="w-full border border-gray-300 bg-gray-50 py-2.5 font-mono text-[11px] uppercase tracking-wider text-ink hover:bg-ink hover:text-white transition font-bold flex items-center justify-center gap-1.5"
          >
            <Sparkles size={13} />
            <span>Instant Admin Access (Localhost Bypass) →</span>
          </button>
          <p className="font-mono text-[10px] text-gray-500 leading-relaxed">
            Instantly opens administration dashboard connected to your Supabase PostgreSQL tables without waiting for email verification.
          </p>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onBackToStore}
            className="font-mono text-xs uppercase tracking-wider text-gray-500 hover:text-ink transition underline underline-offset-4"
          >
            ← Return to Maison Makeeva Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
