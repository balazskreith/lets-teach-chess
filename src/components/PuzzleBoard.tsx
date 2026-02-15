import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

interface PuzzleData {
  pgn: string;
  id: string;
  title?: string;
  fen?: string;
}

interface PuzzleBoardProps {
  pgnFilePath?: string;
}

interface PuzzleState {
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

export default function PuzzleBoard({ pgnFilePath = "/testpuzzles.txt" }: PuzzleBoardProps) {
  const [allPuzzleStates, setAllPuzzleStates] = useState<PuzzleState[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [useDatabase, setUseDatabase] = useState(true);
  const puzzlesPerPage = 6;

  useEffect(() => {
    const loadPuzzles = async () => {
      try {
        let puzzles: PuzzleData[] = [];

        if (useDatabase) {
          // Load from MongoDB
          const response = await fetch('/api/puzzles');
          if (!response.ok) {
            throw new Error(`Failed to fetch from database: ${response.status}`);
          }
          const data = await response.json();

          puzzles = data.puzzles.map((p: any, index: number) => ({
            pgn: p.pgn || '',
            id: p._id,
            title: p.tags && p.tags.length > 0 ? p.tags.join(', ') : `Puzzle ${index + 1}`,
            fen: p.fen,
          }));

          console.log(`Loaded ${puzzles.length} puzzles from database`);
        } else {
          // Load from file
          const response = await fetch(pgnFilePath);
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
          }
          const pgnText = await response.text();

          // Split PGN text into individual puzzles
          puzzles = parsePGNFile(pgnText);
          console.log(`Loaded ${puzzles.length} puzzles from ${pgnFilePath}`);
        }

        if (puzzles.length === 0) {
          setLoadError("No puzzles found");
          setLoading(false);
          return;
        }

        const states = puzzles.map((puzzle, index) => {
          try {
            // For database puzzles, use stored FEN directly if no PGN
            let startFen: string | undefined;
            let solutionMoves: string[] = [];

            if (puzzle.fen && !puzzle.pgn) {
              // Database puzzle with FEN only (no solution moves)
              startFen = puzzle.fen;
              solutionMoves = [];
            } else {
              // Parse PGN to get starting FEN if present
              const fenMatch = puzzle.pgn.match(/\[FEN\s+"([^"]+)"\]/);
              startFen = fenMatch ? fenMatch[1] : puzzle.fen;

              if (puzzle.pgn) {
                const game = new Chess(startFen);
                game.loadPgn(puzzle.pgn);
                // Get the full move history as solution
                solutionMoves = game.history();
              }
            }

            // Determine board orientation based on whose turn it is at the start
            const fenToUse = startFen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
            const turnToMove = fenToUse.split(" ")[1]; // 'w' or 'b'
            const boardOrientation: "white" | "black" = turnToMove === "b" ? "black" : "white";

            return {
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
              startFen: "start",
              currentFen: "start",
              solutionMoves: [],
              currentMoveIndex: 0,
              error: err instanceof Error ? err.message : "Failed to load puzzle",
              title: puzzle.title || `Puzzle ${index + 1}`,
              completed: false,
              showIncorrect: false,
              boardOrientation: "white" as const,
            };
          }
        });

        setAllPuzzleStates(states);
        setLoading(false);
      } catch (err) {
        console.error("Error loading puzzles:", err);
        setLoadError(err instanceof Error ? err.message : "Failed to load puzzles");
        setLoading(false);
      }
    };

    loadPuzzles();
  }, [pgnFilePath, useDatabase]);

  const parsePGNFile = (pgnText: string): PuzzleData[] => {
    const puzzles: PuzzleData[] = [];
    const games = pgnText.split(/(?=\[Event)/g).filter(g => g.trim());

    games.forEach((gameText, index) => {
      const titleMatch = gameText.match(/\[ChapterName\s+"([^"]+)"\]/);
      puzzles.push({
        pgn: gameText.trim(),
        id: `puzzle-${index}`,
        title: titleMatch ? titleMatch[1] : undefined,
      });
    });

    return puzzles;
  };

  if (loading) {
    return <div style={{ color: "var(--text-muted)", padding: "20px" }}>Loading puzzles...</div>;
  }

  if (loadError) {
    return (
      <div style={{ color: "var(--error)", padding: "20px" }}>
        Error loading puzzles: {loadError}
      </div>
    );
  }

  if (allPuzzleStates.length === 0) {
    return <div style={{ color: "var(--text-muted)", padding: "20px" }}>No puzzles available</div>;
  }

  const totalPages = Math.ceil(allPuzzleStates.length / puzzlesPerPage);
  const startIndex = currentPage * puzzlesPerPage;
  const endIndex = startIndex + puzzlesPerPage;
  const currentPuzzles = allPuzzleStates.slice(startIndex, endIndex);

  const handlePieceDrop = (puzzleIndex: number, sourceSquare: string, targetSquare: string) => {
    const actualIndex = startIndex + puzzleIndex;
    const puzzleState = allPuzzleStates[actualIndex];

    if (puzzleState.completed || puzzleState.error) {
      return false;
    }

    // Create a game instance at the current position
    const game = new Chess(puzzleState.currentFen);

    // Try to make the move
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to queen for simplicity
    });

    if (!move) {
      // Invalid move
      return false;
    }

    // Check if this move matches the expected solution move
    const expectedMove = puzzleState.solutionMoves[puzzleState.currentMoveIndex];

    if (move.san === expectedMove) {
      // Correct move!
      const newMoveIndex = puzzleState.currentMoveIndex + 1;
      const completed = newMoveIndex >= puzzleState.solutionMoves.length;

      // Update with user's move
      const updatedStates = [...allPuzzleStates];
      updatedStates[actualIndex] = {
        ...puzzleState,
        currentFen: game.fen(),
        currentMoveIndex: newMoveIndex,
        completed,
        showIncorrect: false,
      };
      setAllPuzzleStates(updatedStates);

      // If not completed, automatically make opponent's move after a short delay
      if (!completed && newMoveIndex < puzzleState.solutionMoves.length) {
        setTimeout(() => {
          const opponentMove = puzzleState.solutionMoves[newMoveIndex];
          const opponentGame = new Chess(game.fen());

          try {
            opponentGame.move(opponentMove);
            const nextMoveIndex = newMoveIndex + 1;
            const nowCompleted = nextMoveIndex >= puzzleState.solutionMoves.length;

            setAllPuzzleStates((prevStates) => {
              const newStates = [...prevStates];
              newStates[actualIndex] = {
                ...newStates[actualIndex],
                currentFen: opponentGame.fen(),
                currentMoveIndex: nextMoveIndex,
                completed: nowCompleted,
              };
              return newStates;
            });
          } catch (err) {
            console.error("Error making opponent move:", err);
          }
        }, 500);
      }

      return true;
    } else {
      // Incorrect move - show message and don't update position
      const updatedStates = [...allPuzzleStates];
      updatedStates[actualIndex] = {
        ...puzzleState,
        showIncorrect: true,
      };
      setAllPuzzleStates(updatedStates);

      // Hide the "Incorrect" message after 1.5 seconds
      setTimeout(() => {
        setAllPuzzleStates((prevStates) => {
          const newStates = [...prevStates];
          newStates[actualIndex] = {
            ...newStates[actualIndex],
            showIncorrect: false,
          };
          return newStates;
        });
      }, 1500);

      return false;
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Source Toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setUseDatabase(true)}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            background: useDatabase ? "var(--primary-brand)" : "var(--surface)",
            color: useDatabase ? "#fff" : "var(--text)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            fontWeight: useDatabase ? "600" : "normal",
          }}
        >
          📚 Database Collection
        </button>
        <button
          onClick={() => setUseDatabase(false)}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            background: !useDatabase ? "var(--primary-brand)" : "var(--surface)",
            color: !useDatabase ? "#fff" : "var(--text)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            fontWeight: !useDatabase ? "600" : "normal",
          }}
        >
          📄 File Puzzles
        </button>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{ maxWidth: "1400px", width: "100%", marginBottom: "20px" }}
      >
        {currentPuzzles.map((state, index) => (
        <div
          key={`puzzle-${index}`}
          className="flex flex-col gap-2 p-4 rounded"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            position: "relative",
          }}
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
            {state.completed && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#22c55e",
                  fontWeight: "600",
                }}
              >
                ✓ Solved
              </span>
            )}
            {state.showIncorrect && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#ef4444",
                  fontWeight: "600",
                }}
              >
                ✗ Wrong move
              </span>
            )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              background: currentPage === 0 ? "var(--surface)" : "var(--primary-brand)",
              color: currentPage === 0 ? "var(--text-muted)" : "#fff",
              border: "1px solid var(--border)",
              cursor: currentPage === 0 ? "not-allowed" : "pointer",
              opacity: currentPage === 0 ? 0.5 : 1,
            }}
          >
            Previous
          </button>

          <span style={{ color: "var(--text)", fontSize: "14px" }}>
            Page {currentPage + 1} of {totalPages} ({allPuzzleStates.length} puzzles)
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              background: currentPage === totalPages - 1 ? "var(--surface)" : "var(--primary-brand)",
              color: currentPage === totalPages - 1 ? "var(--text-muted)" : "#fff",
              border: "1px solid var(--border)",
              cursor: currentPage === totalPages - 1 ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages - 1 ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
