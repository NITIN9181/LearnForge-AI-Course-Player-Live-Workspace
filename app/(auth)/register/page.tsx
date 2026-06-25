"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Registration failed");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forge-void px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="font-display text-display-sm text-forge-text">LearnForge</div>
          <p className="text-body-m text-forge-muted">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-body-s text-forge-muted mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-forge-border bg-forge-surface px-3 py-2 text-body-m text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-violet"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-body-s text-forge-muted mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-forge-border bg-forge-surface px-3 py-2 text-body-m text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-violet"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-body-s text-forge-muted mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-forge-border bg-forge-surface px-3 py-2 text-body-m text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-violet"
              placeholder="Min 6 characters"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-body-s text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-forge-violet px-4 py-2.5 text-body-m font-medium text-white hover:bg-forge-violet-hover disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-body-s text-forge-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-forge-violet hover:text-forge-violet-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
