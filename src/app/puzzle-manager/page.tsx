"use client";

import React, { useState } from "react";
import PuzzleManager from "@/components/admin/PuzzleManager";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useLocale } from "@/hooks/useLocale";
import Link from "next/link";

export default function PuzzleManagerPage() {
  const { currentLocale, setLocale } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid username or password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
        {/* Language Switcher - Top Right */}
        <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 100 }}>
          <LanguageSwitcher currentLocale={currentLocale} onLocaleChange={setLocale} />
        </div>

        {/* Back to Home Link - Top Left */}
        <div style={{ position: "absolute", top: "20px", left: "20px", zIndex: 100 }}>
          <Link
            href="/"
            style={{
              color: "var(--text)",
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              display: "inline-block",
            }}
          >
            ← Back to Home
          </Link>
        </div>

        {/* Login Form */}
        <div
          style={{
            width: "min(400px, 90vw)",
            padding: "40px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          }}
        >
          <h2
            style={{
              color: "var(--text)",
              fontSize: "24px",
              fontWeight: "600",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            Puzzle Manager Login
          </h2>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="username"
                style={{
                  display: "block",
                  color: "var(--text)",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  fontSize: "14px",
                }}
                placeholder="Enter username"
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  color: "var(--text)",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  fontSize: "14px",
                }}
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#ef4444",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  marginBottom: "20px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                background: "var(--primary-brand)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
      {/* Language Switcher - Top Right */}
      <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 100 }}>
        <LanguageSwitcher currentLocale={currentLocale} onLocaleChange={setLocale} />
      </div>

      {/* Back to Home Link - Top Left */}
      <div style={{ position: "absolute", top: "20px", left: "20px", zIndex: 100 }}>
        <Link
          href="/"
          style={{
            color: "var(--text)",
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            display: "inline-block",
          }}
        >
          ← Back to Home
        </Link>
      </div>

      {/* Title */}
      <div className="flex flex-col items-center justify-center gap-2">
        <h1
          className="text-5xl font-bold"
          style={{
            color: "var(--text)",
            background: "linear-gradient(135deg, var(--primary-brand), var(--accent-brand))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          ♚
        </h1>
      </div>

      {/* Content */}
      <div
        style={{
          width: "min(1200px, 95vw)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          borderRadius: 8,
          padding: "20px",
        }}
      >
        <PuzzleManager />
      </div>
    </div>
  );
}
