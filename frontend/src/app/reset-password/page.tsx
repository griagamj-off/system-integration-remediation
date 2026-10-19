"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="auth-shell"><section className="auth-card centered"><h2>Loading reset form...</h2></section></main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset the password.");
      }

      setMessage(data.message || "Password reset successful.");
      setTimeout(() => router.push("/"), 1500);
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Unexpected error.";
      setMessage(nextMessage);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="card-header">
          <span className="eyebrow">Update password</span>
          <h1>Choose a new password</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            New password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              placeholder="Repeat your password"
              required
            />
          </label>

          {message ? (
            <p className={isError ? "status error" : "status success"}>{message}</p>
          ) : null}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Updating..." : "Set new password"}
          </button>
        </form>

        <div className="auth-links">
          <Link href="/">Back to login</Link>
        </div>
      </section>
    </main>
  );
}
