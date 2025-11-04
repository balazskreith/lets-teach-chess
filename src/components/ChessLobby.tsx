"use client";

import React, { useState } from "react";

type Props = {
  onCreateGame?: () => void;
  onJoinGame?: (gameId: string) => void;
  createLabel?: string;
  error?: string | null;
  onClearError?: () => void;
};

export default function ChessLobby({
  onCreateGame,
  onJoinGame,
  createLabel = "Create New Game",
  error,
  onClearError,
}: Props) {
  const [gameId, setGameId] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinClick = () => {
    if (gameId.trim()) {
      onJoinGame?.(gameId.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="dashboard-card surface p-8"
        style={{
          background: "var(--surface)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          boxShadow: "0 12px 30px rgba(2,6,12,0.6), 0 0 22px rgba(255,138,61,0.06)",
          borderRadius: 16,
        }}
      >
        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="mb-6"
            style={{
              background: "linear-gradient(90deg, rgba(239,68,68,0.06), rgba(244,162,97,0.03))",
              border: "1px solid rgba(239,68,68,0.18)",
              color: "var(--text)",
              padding: "12px 16px",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 14, color: "var(--text)" }}>
              <strong style={{ color: "var(--error)", marginRight: 8 }}>Error:</strong>
              <span style={{ color: "var(--text-muted)" }}>{error}</span>
            </div>
            <button
              onClick={() => onClearError?.()}
              className="btn btn-ghost"
              style={{
                color: "var(--text-muted)",
                border: "1px solid rgba(255,255,255,0.02)",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 13,
              }}
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-3"
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
            Play chess online with friends
          </p>
        </div>

        {/* Mode Toggle */}
        <div
          className="flex gap-2 mb-6 p-1"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 10,
            border: "1px solid var(--border)",
          }}
        >
          <button
            onClick={() => setIsJoining(false)}
            className={`flex-1 py-3 px-4 rounded-lg transition-all ${!isJoining ? "font-semibold" : ""}`}
            style={{
              background: !isJoining ? "var(--primary-brand)" : "transparent",
              color: !isJoining ? "#fff" : "var(--text-muted)",
              border: "none",
              fontSize: 15,
            }}
          >
            Create Game
          </button>
          <button
            onClick={() => setIsJoining(true)}
            className={`flex-1 py-3 px-4 rounded-lg transition-all ${isJoining ? "font-semibold" : ""}`}
            style={{
              background: isJoining ? "var(--primary-brand)" : "transparent",
              color: isJoining ? "#fff" : "var(--text-muted)",
              border: "none",
              fontSize: 15,
            }}
          >
            Join Game
          </button>
        </div>

        {/* Content based on mode */}
        {!isJoining ? (
          <div className="space-y-6">
            <div
              className="p-6 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
              }}
            >
              <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text)" }}>
                Create a New Game
              </h3>
              <p className="mb-4" style={{ color: "var(--text-muted)", fontSize: 14 }}>
                Start a new chess game and invite a friend to join. A unique game ID will be generated for sharing.
              </p>
              <ul className="space-y-2 mb-4" style={{ color: "var(--text-muted)", fontSize: 14 }}>
                <li className="flex items-center gap-2">
                  <span style={{ color: "var(--primary-brand)" }}>✓</span>
                  Play as White pieces
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: "var(--primary-brand)" }}>✓</span>
                  Share game ID with opponent
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: "var(--primary-brand)" }}>✓</span>
                  Real-time synchronization
                </li>
              </ul>
            </div>

            <button
              onClick={onCreateGame}
              className="w-full py-4 px-6 rounded-lg font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, var(--primary-brand), var(--accent-brand))",
                border: "none",
                fontSize: 16,
                boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
              }}
            >
              {createLabel}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div
              className="p-6 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
              }}
            >
              <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text)" }}>
                Join an Existing Game
              </h3>
              <p className="mb-4" style={{ color: "var(--text-muted)", fontSize: 14 }}>
                Enter the game ID shared by your opponent to join their game.
              </p>

              <label className="block mb-4">
                <div className="text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
                  Game ID
                </div>
                <input
                  type="text"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  placeholder="Enter game ID..."
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    fontSize: 15,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && gameId.trim()) {
                      handleJoinClick();
                    }
                  }}
                />
              </label>

              <ul className="space-y-2 mb-4" style={{ color: "var(--text-muted)", fontSize: 14 }}>
                <li className="flex items-center gap-2">
                  <span style={{ color: "var(--primary-brand)" }}>✓</span>
                  Play as Black pieces
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: "var(--primary-brand)" }}>✓</span>
                  Automatically synced with opponent
                </li>
              </ul>
            </div>

            <button
              onClick={handleJoinClick}
              disabled={!gameId.trim()}
              className="w-full py-4 px-6 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, var(--primary-brand), var(--accent-brand))",
                border: "none",
                fontSize: 16,
                boxShadow: gameId.trim() ? "0 4px 12px rgba(14, 165, 233, 0.3)" : "none",
              }}
            >
              Join Game
            </button>
          </div>
        )}

        {/* Footer info */}
        <div
          className="mt-8 pt-6 text-center text-sm"
          style={{
            color: "var(--text-muted)",
            borderTop: "1px solid var(--border)",
          }}
        >
          Games are peer-to-peer connected for real-time play
        </div>
      </div>
    </div>
  );
}
