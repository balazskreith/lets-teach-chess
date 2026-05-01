import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

interface PGNViewerProps {
  pgnPath?: string;
}

export default function GameViewer() {
  const [chess, setChess] = useState<Chess | null>(null);
  const [fen, setFen] = useState("start");
  const [currentMove, setCurrentMove] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pgnInput, setPgnInput] = useState("");
  //
  // useEffect(() => {
  //   loadPGNFromFile();
  // }, [pgnPath]);
  //
  // const loadPGNFromFile = async () => {
  //   try {
  //     const response = await fetch(pgnPath);
  //     const pgnText = await response.text();
  //     setPgnInput(pgnText);
  //     loadPGNFromText(pgnText);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "Failed to load PGN file");
  //     console.error("Error loading PGN file:", err);
  //   }
  // };

  const loadPGNFromText = (pgnText: string) => {
    try {
      // Parse PGN headers to get FEN if present
      const fenMatch = pgnText.match(/\[FEN\s+"([^"]+)"\]/);
      const startFen = fenMatch ? fenMatch[1] : undefined;

      const game = new Chess(startFen);

      // Load the PGN
      game.loadPgn(pgnText);

      // Get the full move history
      const moves = game.history();

      // Reset to starting position
      const resetGame = new Chess(startFen);
      setChess(resetGame);
      setFen(resetGame.fen());
      setHistory(moves);
      setCurrentMove(0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PGN");
      console.error("Error loading PGN:", err);
    }
  };

  const handleLoadPGN = () => {
    if (pgnInput.trim()) {
      loadPGNFromText(pgnInput);
    }
  };

  const goToMove = (moveIndex: number) => {
    if (!chess || !history.length) return;

    // Parse starting FEN from original PGN
    const fenMatch = chess.pgn().match(/\[FEN\s+"([^"]+)"\]/);
    const startFen = fenMatch ? fenMatch[1] : undefined;

    const tempGame = new Chess(startFen);

    for (let i = 0; i < moveIndex; i++) {
      tempGame.move(history[i]);
    }

    setFen(tempGame.fen());
    setCurrentMove(moveIndex);
  };

  const goToStart = () => goToMove(0);
  const goToPrevious = () => goToMove(Math.max(0, currentMove - 1));
  const goToNext = () => goToMove(Math.min(history.length, currentMove + 1));
  const goToEnd = () => goToMove(history.length);

  if (error) {
    return <div style={{ color: "var(--error)" }}>Error: {error}</div>;
  }

  if (!chess) {
    return <div style={{ color: "var(--text-muted)" }}>Loading PGN...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6" style={{ maxWidth: "1200px", width: "100%" }}>
      {/* Left side - PGN Input */}
      <div className="flex flex-col gap-4" style={{ flex: "1", minWidth: "300px" }}>
        <div
          className="p-4 rounded"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <label className="block mb-2" style={{ color: "var(--text)", fontWeight: "500" }}>
            PGN Input
          </label>
          <textarea
            value={pgnInput}
            onChange={(e) => setPgnInput(e.target.value)}
            placeholder="Paste PGN here..."
            rows={12}
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
          <button
            onClick={handleLoadPGN}
            className="mt-3 w-full py-2 px-4 rounded font-semibold"
            style={{
              background: "var(--primary-brand)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Load PGN
          </button>
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
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Right side - Chessboard and Controls */}
      <div className="flex flex-col items-center gap-4" style={{ flex: "1" }}>
        <div style={{ maxWidth: "600px", width: "100%" }}>
          <Chessboard options={{ position: fen }} />
        </div>

        <div className="flex gap-2">
        <button
          onClick={goToStart}
          disabled={currentMove === 0}
          className="px-4 py-2 rounded"
          style={{
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            cursor: currentMove === 0 ? "not-allowed" : "pointer",
            opacity: currentMove === 0 ? 0.5 : 1,
          }}
        >
          ⏮ Start
        </button>
        <button
          onClick={goToPrevious}
          disabled={currentMove === 0}
          className="px-4 py-2 rounded"
          style={{
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            cursor: currentMove === 0 ? "not-allowed" : "pointer",
            opacity: currentMove === 0 ? 0.5 : 1,
          }}
        >
          ◀ Prev
        </button>
        <button
          onClick={goToNext}
          disabled={currentMove === history.length}
          className="px-4 py-2 rounded"
          style={{
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            cursor: currentMove === history.length ? "not-allowed" : "pointer",
            opacity: currentMove === history.length ? 0.5 : 1,
          }}
        >
          Next ▶
        </button>
        <button
          onClick={goToEnd}
          disabled={currentMove === history.length}
          className="px-4 py-2 rounded"
          style={{
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            cursor: currentMove === history.length ? "not-allowed" : "pointer",
            opacity: currentMove === history.length ? 0.5 : 1,
          }}
        >
          End ⏭
        </button>
      </div>

        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Move {currentMove} of {history.length}
        </div>

        <div
          className="p-4 rounded"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            maxWidth: "600px",
            width: "100%",
          }}
        >
          <div style={{ color: "var(--text)", fontFamily: "monospace", fontSize: "14px" }}>
            {history.map((move, index) => {
              const moveNumber = Math.floor(index / 2) + 1;
              const isWhite = index % 2 === 0;
              return (
                <span
                  key={index}
                  onClick={() => goToMove(index + 1)}
                  style={{
                    cursor: "pointer",
                    padding: "2px 4px",
                    background: currentMove === index + 1 ? "var(--primary-brand)" : "transparent",
                    color: currentMove === index + 1 ? "#fff" : "var(--text)",
                    borderRadius: "3px",
                    marginRight: "4px",
                  }}
                >
                  {isWhite && `${moveNumber}.`}
                  {move}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
