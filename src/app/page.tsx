"use client";

import React from "react";
import { Chessboard } from "react-chessboard";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      {/* Title */}
      <div className="text-center">
        <h1
          className="text-5xl font-bold mb-3"
          style={{
            color: "var(--text)",
            background: "linear-gradient(135deg, var(--primary-brand), var(--accent-brand))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          ♔ Tomasz Chess ♚
        </h1>
        <p className="text-lg" style={{ color: "var(--text-muted)" }}>
          Teach and play chess online with friends
        </p>
      </div>

      {/* Chess Board */}
      <div
        style={{
          width: "min(600px, 90vw)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          borderRadius: 8,
        }}
      >
        <Chessboard />
      </div>

      {/* Footer info */}
      <div
        className="text-center text-sm"
        style={{
          color: "var(--text-muted)",
        }}
      >
        Click and drag pieces to move them
      </div>
    </div>
  );
}
