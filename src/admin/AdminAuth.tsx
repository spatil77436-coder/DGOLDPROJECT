import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, Lock, Mail, KeyRound, Eye, EyeOff } from "lucide-react";
import Logo from "../components/Logo";
import { db, startSession } from "../lib/db";
import { Spinner } from "../components/ui";

const LOCK_KEY = "dgold_admin_lock";
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 60;

function lockState(): { fails: number; until: number } {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY) || '{"fails":0,"until":0}');
  } catch {
    return { fails: 0, until: 0 };
  }
}

export default function AdminAuth({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"loading" | "setup" | "login">("loading");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lockLeft, setLockLeft] = useState(0);

  useEffect(() => {
    db.getAdmin()
      .then((a) => setMode(a ? "login" : "setup"))
      .catch(() => setMode("setup"));
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => {
      const l = lockState();
      setLockLeft(Math.max(0, Math.ceil((l.until - Date.now()) / 1000)));
    }, 500);
    return () => window.clearInterval(t);
  }, []);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const l = lockState();
    if (l.until > Date.now()) {
      setError(`Too many attempts. Try again in ${Math.ceil((l.until - Date.now()) / 1000)}s.`);
      return;
    }
    if (!validEmail) {
      setError("Enter a valid email address.");
      return;
    }
    if (mode === "setup") {
      if (pw.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (pw !== pw2) {
        setError("Passwords do not match.");
        return;
      }
      setBusy(true);
      try {
        await db.createAdmin(email, pw);
        startSession();
        onSuccess();
      } catch {
        setError("Could not create the admin account. Please try again.");
      } finally {
        setBusy(false);
      }
      return;
    }
    setBusy(true);
    try {
      const ok = await db.verifyAdmin(email, pw);
      if (ok) {
        localStorage.removeItem(LOCK_KEY);
        startSession();
        onSuccess();
      } else {
        const fails = l.fails + 1;
        const until = fails >= MAX_ATTEMPTS ? Date.now() + LOCK_SECONDS * 1000 : 0;
        localStorage.setItem(LOCK_KEY, JSON.stringify({ fails: until ? 0 : fails, until }));
        setError(
          until
            ? `Too many failed attempts. Locked for ${LOCK_SECONDS} seconds.`
            : `Invalid email or password. ${MAX_ATTEMPTS - fails} attempt${MAX_ATTEMPTS - fails === 1 ? "" : "s"} left.`
        );
        setPw("");
      }
    } catch {
      setError("Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-luxe grain flex items-center justify-center p-4 relative overflow-hidden">
      <div className="orb w-[420px] h-[420px] bg-gold-500/15 top-0 right-0" />
      <div className="orb w-[420px] h-[420px] bg-emerald-700/25 bottom-0 left-0" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative w-full max-w-md">
        <a href="#top" className="inline-flex items-center gap-2 text-sm text-emerald-100/60 hover:text-gold-300 transition-colors mb-5">
          <ArrowLeft className="w-4 h-4" /> Back to website
        </a>

        <div className="rounded-3xl bg-emerald-900/80 backdrop-blur-xl border border-gold-400/25 p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-7">
            <Logo />
            <div className="w-14 h-14 mt-6 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Lock className="w-6 h-6 text-emerald-950" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mt-4">
              {mode === "setup" ? "Create Admin Account" : "Admin Sign In"}
            </h1>
            <p className="text-emerald-100/55 text-sm mt-1.5">
              {mode === "setup"
                ? "First-time setup — set the credentials that will protect this dashboard."
                : "Authorised personnel only. Sessions expire after 8 hours."}
            </p>
          </div>

          {mode === "loading" ? (
            <div className="py-10 flex justify-center"><Spinner className="border-white/20 border-t-gold-400" /></div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="lbl">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-100/35" />
                  <input type="email" className="field !pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" autoComplete="username" required />
                </div>
              </div>
              <div>
                <label className="lbl">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-100/35" />
                  <input
                    type={showPw ? "text" : "password"}
                    className="field !pl-10 !pr-11"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    placeholder={mode === "setup" ? "Minimum 8 characters" : "Your password"}
                    autoComplete={mode === "setup" ? "new-password" : "current-password"}
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-100/40 hover:text-gold-300" aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {mode === "setup" && (
                <div>
                  <label className="lbl">Confirm Password</label>
                  <input type={showPw ? "text" : "password"} className="field" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Re-enter password" autoComplete="new-password" required />
                </div>
              )}
              {error && (
                <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-semibold text-rose-300 bg-rose-400/10 border border-rose-400/30 rounded-xl px-4 py-2.5">
                  {error}
                </motion.p>
              )}
              <button type="submit" disabled={busy || lockLeft > 0} className="btn-gold w-full py-3.5 disabled:opacity-50">
                {busy ? <Spinner /> : (<><ShieldCheck className="w-5 h-5" /> {mode === "setup" ? "Create Account & Sign In" : lockLeft > 0 ? `Locked · ${lockLeft}s` : "Sign In"}</>)}
              </button>
            </form>
          )}

          <p className="text-center text-[11px] text-emerald-100/35 mt-6 leading-relaxed">
            Credentials are stored as a salted PBKDF2 hash — never in plain text.
            Data lives in this browser's local database; connect a hosted backend for multi-device access.
          </p>
        </div>
      </motion.div>
    </div>
  );
}