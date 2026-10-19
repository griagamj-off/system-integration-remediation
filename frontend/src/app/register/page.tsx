"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { API_BASE } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        const detail = data.errors ? Object.values(data.errors).flat().join(" ") : data.message || "Registration failed.";
        throw new Error(detail);
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("access_token", data.token);
      }

      router.push("/dashboard");
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
          <span className="eyebrow">Create account</span>
          <h1>Register</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full name
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Your name"
              required
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              value={form.password_confirmation}
              onChange={(event) => handleChange("password_confirmation", event.target.value)}
              placeholder="Repeat your password"
              required
            />
          </label>

          {message ? (
            <p className={isError ? "status error" : "status success"}>{message}</p>
          ) : null}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-links">
          <Link href="/">Back to login</Link>
        </div>
      </section>
    </main>
  );
}
