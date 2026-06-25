"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forge-void px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="font-display text-display-sm text-forge-text">
            LearnForge
          </div>
          <p className="text-body-m text-forge-muted">
            Sign in to continue learning
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="demo@learnforge.dev"
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
              className="w-full rounded-lg border border-forge-border bg-forge-surface px-3 py-2 text-body-m text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-violet"
              placeholder="demo-learner"
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-body-s text-forge-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-forge-violet hover:text-forge-violet-hover">
            Sign up
          </Link>
        </p>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setEmail("demo@learnforge.dev");
              setPassword("demo-learner");
            }}
            className="text-body-s text-forge-muted hover:text-forge-text transition-colors underline underline-offset-2"
          >
            Try Demo Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
