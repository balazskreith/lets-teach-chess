"use client";

import React, { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function PuzzleManager() {
  const [position, setPosition] = useState("start");
  const [fenInput, setFenInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSetPosition = () => {
    if (!fenInput.trim()) {
      setError("Please enter a FEN string");
      return;
    }

    try {
      // Validate FEN by creating a Chess instance
      const game = new Chess(fenInput.trim());
      setPosition(game.fen());
      setError(null);
    } catch (err) {
      setError("Invalid FEN string");
    }
  };

  const handleClearBoard = () => {
    setPosition("8/8/8/8/8/8/8/8 w - - 0 1");
    setFenInput("8/8/8/8/8/8/8/8 w - - 0 1");
    setError(null);
  };

  const handleResetPosition = () => {
    setPosition("start");
    setFenInput("");
    setError(null);
  };

  const handleGetFen = () => {
    setFenInput(position);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6" style={{ maxWidth: "1200px", width: "100%" }}>
      {/* Left side - Controls */}
      <div className="flex flex-col gap-4" style={{ flex: "1", minWidth: "300px" }}>
        <div
          className="p-4 rounded"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <h3 className="mb-4" style={{ color: "var(--text)", fontWeight: "600", fontSize: "18px" }}>
            Puzzle Manager
          </h3>

          <div className="mb-4">
            <label className="block mb-2" style={{ color: "var(--text)", fontWeight: "500" }}>
              FEN Position
            </label>
            <textarea
              value={fenInput}
              onChange={(e) => setFenInput(e.target.value)}
              placeholder="Enter FEN string..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                fontFamily: "monospace",
                fontSize: "13px",
                resize: "vertical",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "var(--error)",
                padding: "12px",
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              onClick={handleSetPosition}
              className="w-full py-2 px-4 rounded font-semibold"
              style={{
                background: "var(--primary-brand)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Set Position
            </button>

            <button
              onClick={handleGetFen}
              className="w-full py-2 px-4 rounded font-semibold"
              style={{
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              Get Current FEN
            </button>

            <button
              onClick={handleResetPosition}
              className="w-full py-2 px-4 rounded font-semibold"
              style={{
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              Reset to Start
            </button>

            <button
              onClick={handleClearBoard}
              className="w-full py-2 px-4 rounded font-semibold"
              style={{
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              Clear Board
            </button>
          </div>
        </div>

        <div
          className="p-4 rounded"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <h4 className="mb-2" style={{ color: "var(--text)", fontWeight: "600", fontSize: "16px" }}>
            Instructions
          </h4>
          <ul
            style={{
              color: "var(--text-muted)",
              fontSize: "14px",
              lineHeight: "1.6",
              paddingLeft: "20px",
            }}
          >
            <li>Enter a FEN string to set a custom position</li>
            <li>Click "Set Position" to apply</li>
            <li>Use "Get Current FEN" to copy the current position</li>
            <li>Drag pieces to arrange the position manually (coming soon)</li>
          </ul>
        </div>
      </div>

      {/* Right side - Chessboard */}
      <div className="flex flex-col items-center gap-4" style={{ flex: "1" }}>
        <div style={{ maxWidth: "600px", width: "100%" }}>
          <Chessboard options={{ position }} />
        </div>

        <div
          className="p-3 rounded"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            maxWidth: "600px",
            width: "100%",
          }}
        >
          <div style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "500", marginBottom: "4px" }}>
            Current Position:
          </div>
          <div
            style={{
              color: "var(--text)",
              fontFamily: "monospace",
              fontSize: "13px",
              wordBreak: "break-all",
            }}
          >
            {position}
          </div>
        </div>
      </div>
    </div>
  );
}
