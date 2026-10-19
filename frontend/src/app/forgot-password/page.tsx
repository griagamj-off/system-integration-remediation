"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { API_BASE } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to process your request.");
      }

      setMessage(`${data.message} Demo reset token: ${data.token}`);
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
          <span className="eyebrow">Password recovery</span>
          <h1>Reset your password</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Registered email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          {message ? (
            <p className={isError ? "status error" : "status success"}>{message}</p>
          ) : null}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Submitting..." : "Send reset link"}
          </button>
        </form>

        <div className="auth-links">
          <Link href="/">Back to login</Link>
        </div>
      </section>
    </main>
  );
}
