"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div style={{ maxWidth: "400px", margin: "100px auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Admin Login</h1>
        <div className="card">
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem" }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>
            {error && (
              <p style={{ color: "var(--danger)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
}
