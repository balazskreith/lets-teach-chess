import React, { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import TagHandler from "./TagHandler";

export default function PuzzleManager() {
  const [position, setPosition] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [fenInput, setFenInput] = useState("");
  const [pgnInput, setPgnInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    setPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    setFenInput("");
    setError(null);
  };

  const handleGetFen = () => {
    setFenInput(position);
  };

  const handleLoadPGN = () => {
    if (!pgnInput.trim()) {
      setError("Please enter a PGN string");
      return;
    }

    try {
      // Parse PGN headers to get FEN if present
      const fenMatch = pgnInput.match(/\[FEN\s+"([^"]+)"]/);
      const startFen = fenMatch ? fenMatch[1] : undefined;

      // Clean PGN: remove comments in braces, parenthetical variations, and annotations
      let cleanedPgn = pgnInput.trim();

      // Remove comments in braces {comment}
      cleanedPgn = cleanedPgn.replace(/\{[^}]*}/g, ' ');

      // Remove variations in parentheses (variation)
      cleanedPgn = cleanedPgn.replace(/\([^)]*\)/g, ' ');

      // Remove NAG annotations like $1, $2, etc.
      cleanedPgn = cleanedPgn.replace(/\$\d+/g, ' ');

      // Remove annotation symbols !!, !, !?, ?!, ?, ??
      cleanedPgn = cleanedPgn.replace(/[!?]{1,2}/g, ' ');

      // Normalize whitespace
      cleanedPgn = cleanedPgn.replace(/\s+/g, ' ').trim();

      const game = new Chess(startFen);

      // Load cleaned PGN
      game.loadPgn(cleanedPgn, {
        strict: false,
        newlineChar: '\n'
      });

      setPosition(game.fen());
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid PGN string";
      setError(`Invalid PGN string: ${errorMessage}`);
      console.error("PGN parsing error:", err);
    }
  };

  const handleSavePuzzle = async () => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await fetch('/api/puzzles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen: position,
          pgn: pgnInput,
          tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save puzzle');
      }

      setSuccess('Puzzle saved successfully!');
      // Clear inputs after successful save
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save puzzle";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6" style={{ maxWidth: "1200px", width: "100%" }}>
      {/* Left side - Chessboard */}
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

      {/* Right side - Controls */}
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

          <div className="mb-4">
            <label className="block mb-2" style={{ color: "var(--text)", fontWeight: "500" }}>
              PGN
            </label>
            <textarea
              value={pgnInput}
              onChange={(e) => setPgnInput(e.target.value)}
              placeholder="Enter PGN string..."
              rows={5}
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

          <div className="mb-4">
            <TagHandler tags={tags} onTagChange={setTags} />
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

          {success && (
            <div
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                color: "#22c55e",
                padding: "12px",
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              {success}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              onClick={handleSavePuzzle}
              disabled={isSaving}
              className="w-full py-2 px-4 rounded font-semibold"
              style={{
                background: isSaving ? "rgba(34,197,94,0.5)" : "#22c55e",
                color: "#fff",
                border: "none",
                cursor: isSaving ? "not-allowed" : "pointer",
              }}
            >
              {isSaving ? "Saving..." : "💾 Save Puzzle to Collection"}
            </button>

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
              Set Position from FEN
            </button>

            <button
              onClick={handleLoadPGN}
              className="w-full py-2 px-4 rounded font-semibold"
              style={{
                background: "var(--primary-brand)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Load PGN
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
            <li>Enter a FEN string and click "Set Position from FEN"</li>
            <li>Or paste a PGN and click "Load PGN" to see the final position</li>
            <li>Use "Get Current FEN" to copy the current position</li>
            <li>Drag pieces to arrange the position manually (coming soon)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
