"use client";

import { useState, useRef, useCallback, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

function TwoFactorInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = useCallback(
    (index: number, char: string) => {
      if (!/^\d?$/.test(char)) return;
      const newDigits = [...digits];
      newDigits[index] = char;
      const newCode = newDigits.join("");
      onChange(newCode.replace(/\s/g, ""));
      if (char && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits, onChange]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (pasted) {
        onChange(pasted);
        const focusIndex = Math.min(pasted.length, 5);
        inputRefs.current[focusIndex]?.focus();
      }
    },
    [onChange]
  );

  return (
    <div className="flex gap-2" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          autoFocus={i === 0}
          className="w-10 h-11 text-center text-base font-medium border border-slate-300 rounded-md bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 disabled:opacity-50"
        />
      ))}
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-5">
      <div className={`w-1.5 h-1.5 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-slate-300"}`} />
      <div className={`w-1.5 h-1.5 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-slate-300"}`} />
      <div className={`w-1.5 h-1.5 rounded-full ${step >= 3 ? "bg-blue-600" : "bg-slate-300"}`} />
      <span className="text-[11px] text-slate-500 ml-1">
        {step === 1 ? "Sign in" : step === 2 ? "Password" : "2FA verification"}
      </span>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [step, setStep] = useState<"email" | "password" | "2fa">("email");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError("");
    setError("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Invalid email address");
      return;
    }
    setStep("password");
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldError("");

    if (!password) {
      setFieldError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("2FA_REQUIRED") || result.error.includes("two-factor") || result.error.includes("2FA")) {
          setStep("2fa");
        } else {
          setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error);
        }
      } else {
        const session = await getSession();
        const role = session?.user?.role;
        if (role === "ADMIN" || role === "SUPER_ADMIN") {
          router.push("/admin");
        } else {
          router.push("/admin");
        }
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleTwoFactor(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const code = useBackupCode ? backupCode.trim() : twoFactorCode;
    if (!code) {
      setError("Please enter a code");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        twoFactorCode: code,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Invalid verification code" : result.error);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  function renderRightPanel() {
    if (step === "2fa") {
      return (
        <>
          <StepIndicator step={3} />
          <h2 className="text-lg font-medium text-slate-900 mb-1">Two-factor authentication</h2>
          <p className="text-[13px] text-slate-500 mb-7">
            {useBackupCode
              ? "Enter one of your backup codes to sign in."
              : "Enter the 6-digit code from your authenticator app."}
          </p>

          <form onSubmit={handleTwoFactor} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Email</label>
              <input type="email" value={email} readOnly className="w-full px-3 py-2.5 text-[13px] border border-slate-300 rounded-md bg-slate-50 text-slate-900 focus:outline-none" />
            </div>

            {useBackupCode ? (
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Backup code</label>
                <input value={backupCode} onChange={(e) => setBackupCode(e.target.value)} placeholder="xxxx-xxxx" autoFocus disabled={loading} className="w-full px-3 py-2.5 text-[13px] border border-slate-300 rounded-md bg-slate-50 text-slate-900 font-mono text-center focus:outline-none focus:border-blue-600 disabled:opacity-50" />
              </div>
            ) : (
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Verification code</label>
                <TwoFactorInput value={twoFactorCode} onChange={setTwoFactorCode} disabled={loading} />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-2.5 bg-slate-800 text-white text-[13px] font-medium rounded-md hover:bg-slate-700 disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Log In
            </button>

            <div className="flex justify-end mt-3.5">
              <button type="button" onClick={() => { setUseBackupCode(!useBackupCode); setError(""); }} className="text-xs text-slate-500 hover:text-blue-600 cursor-pointer">
                {useBackupCode ? "Use authenticator app" : "Use a backup code"}
              </button>
            </div>
          </form>
        </>
      );
    }

    if (step === "password") {
      return (
        <>
          <StepIndicator step={2} />
          <h2 className="text-lg font-medium text-slate-900 mb-1">Welcome back</h2>
          <p className="text-[13px] text-slate-500 mb-7">Enter your password to continue.</p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Email</label>
              <input type="email" value={email} readOnly className="w-full px-3 py-2.5 text-[13px] border border-slate-300 rounded-md bg-slate-50 text-slate-900 focus:outline-none" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-500">Password</label>
                <Link href="/forgot-password" className="text-[11px] text-slate-500 hover:text-blue-600">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus placeholder="Enter your password" disabled={loading} className="w-full px-3 py-2.5 pr-10 text-[13px] border border-slate-300 rounded-md bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 disabled:opacity-50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 bg-slate-800 text-white text-[13px] font-medium rounded-md hover:bg-slate-700 disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Log In
            </button>

            <div className="flex justify-between mt-3.5">
              <button type="button" onClick={() => { setStep("email"); setPassword(""); setError(""); }} className="text-xs text-slate-500 hover:text-blue-600 cursor-pointer">
                Use a different email
              </button>
            </div>
          </form>
        </>
      );
    }

    return (
      <>
        <StepIndicator step={1} />
        <h2 className="text-lg font-medium text-slate-900 mb-1">Sign in</h2>
        <p className="text-[13px] text-slate-500 mb-7">Enter your email to get started.</p>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setFieldError(""); }} required autoFocus placeholder="you@example.com" disabled={loading} className="w-full px-3 py-2.5 text-[13px] border border-slate-300 rounded-md bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 disabled:opacity-50" />
            {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
          </div>

          <button type="submit" disabled={loading || !email} className="w-full py-2.5 bg-slate-800 text-white text-[13px] font-medium rounded-md hover:bg-slate-700 disabled:opacity-50 mt-2">
            Continue
          </button>
        </form>
      </>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[480px] max-w-3xl w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        {/* Left panel */}
        <div className="bg-slate-800 px-9 py-10 flex flex-col justify-between">
          <div className="text-[13px] font-medium tracking-[0.1em] text-white">
            HUNEGNAW<span className="text-blue-300">PRESS</span>
          </div>

          <div>
            <h1 className="text-[22px] font-semibold text-white leading-snug">
              Your site.<br />Your way.
            </h1>
            <p className="text-[13px] text-white/45 mt-2">Content management made simple.</p>
          </div>

          <p className="text-[10px] text-white/20 leading-relaxed">
            HunegnawPress is a modern CMS and website builder. Sign in to manage your website content, pages, and settings.
          </p>
        </div>

        {/* Right panel */}
        <div className="bg-white px-9 py-10 flex flex-col justify-center">
          {renderRightPanel()}
        </div>
      </div>
    </div>
  );
}
