import { ArrowRight, Lock, LogOut, ShieldAlert } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { MaisonMakeevaLogo } from "../MaisonMakeevaLogo";

export const AdminAuthGate: React.FC<{ onBackToStore: () => void }> = ({ onBackToStore }) => {
  const { user, isAdmin, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || "Invalid administrative credentials.");
      } else if (res.role !== "admin") {
        // Customer account attempting to enter admin area
        await logout();
        setError(
          `ACCESS DENIED: The account "${email}" is registered as a Client and does not possess administrator privileges. Only verified Maison Makeeva administrators can access /admin.`
        );
      }
    } catch (err: any) {
      setError(err?.message || "Authentication verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchAccount = async () => {
    await logout();
    setEmail("");
    setPassword("");
    setError(null);
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
            Secure administrative control portal for products, orders, inventory and client dossiers.
          </p>
        </div>

        {/* If user is logged in but not an admin */}
        {user && !isAdmin && (
          <div className="border border-amber-200 bg-amber-50 p-4 font-mono text-xs text-amber-900 space-y-3">
            <div className="flex items-start gap-2">
              <ShieldAlert size={16} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Client Account Detected</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Currently signed in as <span className="font-bold">{user.email}</span> (Role: Client). This account does not possess administrator clearance.
                </p>
              </div>
            </div>
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={handleSwitchAccount}
                className="flex-1 bg-ink text-white py-2 px-3 uppercase text-[11px] font-bold hover:bg-gray-800 transition flex items-center justify-center gap-1.5"
              >
                <LogOut size={13} />
                <span>Switch to Admin Account</span>
              </button>
              <button
                type="button"
                onClick={onBackToStore}
                className="border border-gray-300 py-2 px-3 uppercase text-[11px] text-gray-700 hover:bg-gray-100 transition"
              >
                Return to Store
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="border border-red-200 bg-red-50 p-3.5 text-red-800 font-mono text-xs space-y-2">
            <div className="flex items-start gap-2">
              <ShieldAlert size={16} className="shrink-0 text-red-600 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-gray-700 font-semibold mb-1">
              Administrator Email
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
            ) : (
              <>
                <Lock size={14} />
                <span>Verify & Enter Administration</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 text-center border-t border-gray-100">
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
