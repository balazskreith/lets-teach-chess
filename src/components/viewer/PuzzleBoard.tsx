import React, { useCallback, useEffect, useState } from "react";
import { Chess } from "chess.js";
import PuzzleFilter, { PuzzleFilters } from "./PuzzleFilter";
import { Chessboard } from "react-chessboard";

interface PuzzleData {
  pgn: string;
  id: string;
  title?: string;
  fen?: string;
}

interface PuzzleState {
  id: string;
  startFen: string;
  currentFen: string;
  solutionMoves: string[];
  currentMoveIndex: number;
  error: string | null;
  title: string;
  completed: boolean;
  showIncorrect: boolean;
  boardOrientation: "white" | "black";
}

const PUZZLES_PER_PAGE = 6;

function parsePuzzle(puzzle: PuzzleData, index: number): PuzzleState {
  try {
    let startFen: string | undefined;
    let solutionMoves: string[] = [];

    if (puzzle.fen && !puzzle.pgn) {
      startFen = puzzle.fen;
    } else {
      const fenMatch = puzzle.pgn.match(/\[FEN\s+"([^"]+)"\]/);
      startFen = fenMatch ? fenMatch[1] : puzzle.fen;

      if (puzzle.pgn) {
        const game = new Chess(startFen);
        game.loadPgn(puzzle.pgn);
        solutionMoves = game.history();
      }
    }

    const fenToUse = startFen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const boardOrientation: "white" | "black" = fenToUse.split(" ")[1] === "b" ? "black" : "white";

    return {
      id: puzzle.id,
      startFen: fenToUse,
      currentFen: fenToUse,
      solutionMoves,
      currentMoveIndex: 0,
      error: null,
      title: puzzle.title || `Puzzle ${index + 1}`,
      completed: false,
      showIncorrect: false,
      boardOrientation,
    };
  } catch (err) {
    return {
      id: puzzle.id,
      startFen: "start",
      currentFen: "start",
      solutionMoves: [],
      currentMoveIndex: 0,
      error: err instanceof Error ? err.message : "Failed to load puzzle",
      title: puzzle.title || `Puzzle ${index + 1}`,
      completed: false,
      showIncorrect: false,
      boardOrientation: "white",
    };
  }
}

export default function PuzzleBoard() {
  const [pageStates, setPageStates] = useState<PuzzleState[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPuzzles, setTotalPuzzles] = useState(0);
  const [filters, setFilters] = useState<PuzzleFilters>({ minRating: null, maxRating: null, theme: null });
  const totalPages = Math.ceil(totalPuzzles / PUZZLES_PER_PAGE);

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PUZZLES_PER_PAGE) });
      if (filters.minRating !== null) params.set('minRating', String(filters.minRating));
      if (filters.maxRating !== null) params.set('maxRating', String(filters.maxRating));
      if (filters.theme) params.set('theme', filters.theme);

      const response = await fetch(`/api/puzzles?${params}`);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      const data = await response.json();

      if (page === 0) setTotalPuzzles(data.total);

      const puzzles: PuzzleData[] = data.puzzles.map((p: any, i: number) => ({
        pgn: p.pgn || "",
        id: p._id,
        title: p.tags?.length > 0 ? p.tags.join(", ") : `Puzzle ${page * PUZZLES_PER_PAGE + i + 1}`,
        fen: p.fen,
      }));

      if (puzzles.length === 0 && page === 0) {
        setLoadError("No puzzles found");
      } else {
        setPageStates(puzzles.map((p, i) => parsePuzzle(p, page * PUZZLES_PER_PAGE + i)));
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load puzzles");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, loadPage]);

  const handleFilterApply = (newFilters: PuzzleFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };


  const handlePieceDrop = (puzzleIndex: number, sourceSquare: string, targetSquare: string) => {
    const puzzleState = pageStates[puzzleIndex];
    if (puzzleState.completed || puzzleState.error) return false;

    const game = new Chess(puzzleState.currentFen);
    const move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (!move) return false;

    const expectedMove = puzzleState.solutionMoves[puzzleState.currentMoveIndex];

    if (move.san === expectedMove) {
      const newMoveIndex = puzzleState.currentMoveIndex + 1;
      const completed = newMoveIndex >= puzzleState.solutionMoves.length;

      setPageStates((prev) => {
        const next = [...prev];
        next[puzzleIndex] = { ...puzzleState, currentFen: game.fen(), currentMoveIndex: newMoveIndex, completed, showIncorrect: false };
        return next;
      });

      if (!completed && newMoveIndex < puzzleState.solutionMoves.length) {
        setTimeout(() => {
          const opponentMove = puzzleState.solutionMoves[newMoveIndex];
          const opponentGame = new Chess(game.fen());
          try {
            opponentGame.move(opponentMove);
            const nextMoveIndex = newMoveIndex + 1;
            setPageStates((prev) => {
              const next = [...prev];
              next[puzzleIndex] = {
                ...next[puzzleIndex],
                currentFen: opponentGame.fen(),
                currentMoveIndex: nextMoveIndex,
                completed: nextMoveIndex >= puzzleState.solutionMoves.length,
              };
              return next;
            });
          } catch {}
        }, 500);
      }
      return true;
    } else {
      setPageStates((prev) => {
        const next = [...prev];
        next[puzzleIndex] = { ...puzzleState, showIncorrect: true };
        return next;
      });
      setTimeout(() => {
        setPageStates((prev) => {
          const next = [...prev];
          next[puzzleIndex] = { ...next[puzzleIndex], showIncorrect: false };
          return next;
        });
      }, 1500);
      return false;
    }
  };

  if (loadError && pageStates.length === 0) {
    return <div style={{ color: "var(--error)", padding: "20px" }}>Error loading puzzles: {loadError}</div>;
  }

  return (
    <div style={{ width: "100%" }}>
      <PuzzleFilter onApply={handleFilterApply} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ maxWidth: "1400px", width: "100%", marginBottom: "20px" }}>
        {pageStates.map((state, index) => (
          <div
            key={state.id}
            className="flex flex-col gap-2 p-4 rounded"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", position: "relative" }}
          >
            <div
              style={{
                color: "var(--text)",
                fontWeight: "500",
                fontSize: "14px",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{state.title}</span>
              {state.completed && <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: "600" }}>✓ Solved</span>}
              {state.showIncorrect && <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "600" }}>✗ Wrong move</span>}
            </div>

            <div style={{ width: "100%", aspectRatio: "1/1" }}>
              {state.error ? (
                <div
                  style={{
                    color: "var(--error)",
                    padding: "12px",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  Error: {state.error}
                </div>
              ) : (
                <Chessboard
                  options={{
                    position: state.currentFen,
                    boardOrientation: state.boardOrientation,
                    onPieceDrop: ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
                      if (!targetSquare) return false;
                      return handlePieceDrop(index, sourceSquare, targetSquare);
                    },
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "20px" }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0 || loading}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              background: currentPage === 0 ? "var(--surface)" : "var(--primary-brand)",
              color: currentPage === 0 ? "var(--text-muted)" : "#fff",
              border: "1px solid var(--border)",
              cursor: currentPage === 0 || loading ? "not-allowed" : "pointer",
              opacity: currentPage === 0 ? 0.5 : 1,
            }}
          >
            Previous
          </button>

          <span style={{ color: "var(--text)", fontSize: "14px" }}>
            Page {currentPage + 1} of {totalPages} ({totalPuzzles} puzzles)
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1 || loading}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              background: currentPage === totalPages - 1 ? "var(--surface)" : "var(--primary-brand)",
              color: currentPage === totalPages - 1 ? "var(--text-muted)" : "#fff",
              border: "1px solid var(--border)",
              cursor: currentPage === totalPages - 1 || loading ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages - 1 ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading puzzles...</span>
        </div>
      )}
    </div>
  );
}
