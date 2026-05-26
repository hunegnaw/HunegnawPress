"use client";

import { useState } from "react";
import Link from "next/link";
import { validateEmail } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError("");

    if (!validateEmail(email)) {
      setFieldError("Invalid email address");
      return;
    }

    setLoading(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
          <p className="mt-2 text-sm text-slate-500">Enter your email to receive a reset link</p>
        </div>

        {submitted ? (
          <div className="text-center">
            <p className="text-sm text-slate-500">
              If an account exists with that email, you&apos;ll receive a password reset link.
            </p>
            <Link href="/login" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldError(""); }}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="you@example.com"
              />
              {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>

            <div className="text-center text-sm">
              <Link href="/login" className="text-blue-600 hover:underline">Back to sign in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
