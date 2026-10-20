import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  User as UserIcon,
  CheckCircle2,
} from "lucide-react";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginAsGuest,
} from "../services/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      let user;
      if (mode === "login") {
        user = await loginWithEmail(email, password);
      } else {
        user = await registerWithEmail(email, password);
      }
      onSuccess(user);
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = err?.message || "Authentication failed. Please verify credentials.";
      if (message.includes("user-not-found") || message.includes("wrong-password")) {
        message = "Invalid email or password combination.";
      } else if (message.includes("email-already-in-use")) {
        message = "This email is already registered. Please sign in instead.";
      } else if (message.includes("weak-password")) {
        message = "Password must be at least 6 characters.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      console.error("Google auth error:", err);
      setError(err?.message || "Google sign-in was cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginAsGuest();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      console.error("Guest login error:", err);
      setError("Failed to initialize guest session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {mode === "login" ? "Sign In to Your Workspace" : "Create Wealth Account"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            Save multiple portfolios, protect custom simulations, and access institutional analytics.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-lg mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === "login"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === "register"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            New Account
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Quick Sign-in */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full mb-4 py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-[#0f172a] px-3 text-slate-500 font-medium">or with email</span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@familyoffice.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-4"
          >
            {loading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <span>{mode === "login" ? "Sign In" : "Create Account & Sync"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest Session Option */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleGuestContinue}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-sky-400 transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Continue as Guest (Store locally in browser)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
