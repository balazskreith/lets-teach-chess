import { Chess, Square } from 'chess.js';
import { useState, useRef, useEffect } from 'react';
import { Chessboard } from "react-chessboard";
import type { SquareHandlerArgs, PieceDropHandlerArgs } from "react-chessboard";

function getGameResult(game: Chess): string {
  if (game.isCheckmate()) {
    return game.turn() === 'b' ? 'Checkmate — You win!' : 'Checkmate — Engine wins!';
  }
  if (game.isStalemate()) return 'Draw by stalemate';
  if (game.isInsufficientMaterial()) return 'Draw — Insufficient material';
  if (game.isThreefoldRepetition()) return 'Draw — Threefold repetition';
  return 'Draw';
}

const DIFFICULTY_LEVELS = [
    { label: 'Beginner',     skillLevel: 1,  depth: 3  },
    { label: 'Easy',         skillLevel: 5,  depth: 5  },
    { label: 'Intermediate', skillLevel: 10, depth: 8  },
    { label: 'Advanced',     skillLevel: 15, depth: 12 },
    { label: 'Expert',       skillLevel: 20, depth: 15 },
] as const;

type DifficultyIndex = 0 | 1 | 2 | 3 | 4;

const ChessGameBot: React.FC = () => {
    // create a chess game using a ref to always have access to the latest game state within closures and maintain the game state across renders
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;
    const engineRef = useRef<Worker | null>(null);
    const isEngineReadyRef = useRef(false);
    const [difficultyIndex, setDifficultyIndex] = useState<DifficultyIndex>(2);

    // Initialize Stockfish engine
    useEffect(() => {
        const initEngine = async () => {
            console.log("Initializing Stockfish engine...");

            try {
                // Check if script already loaded
                const existingScript = document.querySelector('script[src="/stockfish/stockfish.js"]');

                if (!existingScript) {
                    // Load Stockfish dynamically from public directory
                    const script = document.createElement('script');
                    script.src = '/stockfish/stockfish.js';

                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });

                    console.log("Stockfish script loaded");
                } else {
                    console.log("Stockfish script already loaded");
                }

                // Wait a bit for script to be fully available
                await new Promise(resolve => setTimeout(resolve, 100));

                // Access the global Stockfish function
                const Stockfish = (window as any).Stockfish;
                if (!Stockfish) {
                    throw new Error("Stockfish not found on window");
                }

                console.log("Creating Stockfish instance...");

                // Create Stockfish instance
                const engine = await Stockfish();

                console.log("Stockfish instance created");

                // Store reference
                engineRef.current = engine as any;

                // Wait for uciok message before marking as ready
                const readyPromise = new Promise<void>((resolve) => {
                    engine.addMessageListener((message: string) => {
                        console.log("Engine message:", message);
                        if (message.includes('uciok')) {
                            resolve();
                        }
                    });
                });

                // Initialize UCI protocol
                console.log("Sending uci command");
                engine.postMessage('uci');

                // Wait for uciok with timeout
                await Promise.race([
                    readyPromise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Engine initialization timeout")), 5000))
                ]);

                console.log("Engine initialized and ready!");
                isEngineReadyRef.current = true;
                setIsEngineReady(true);
            } catch (error) {
                console.error("Error initializing Stockfish engine:", error);
                isEngineReadyRef.current = false;
                setIsEngineReady(false);
            }
        };

        initEngine();

        // Cleanup on unmount
        return () => {
            if (engineRef.current) {
                console.log("Cleaning up engine");
                (engineRef.current as any).postMessage?.('quit');
                (engineRef.current as any).terminate?.();
            }
        };
    }, []);

    // track the current position of the chess game in state to trigger a re-render of the chessboard
    const [chessPosition, setChessPosition] = useState(chessGame.fen());
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState({});
    const [isEngineThinking, setIsEngineThinking] = useState(false);
    const [isEngineReady, setIsEngineReady] = useState(false);
    const [gameResult, setGameResult] = useState<string | null>(null);
    const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');

    // Make Stockfish engine move
    async function makeEngineMove() {
      console.log("makeEngineMove called, isEngineReady:", isEngineReadyRef.current);

      // Check if engine is ready
      if (!isEngineReadyRef.current) {
        console.log("Engine not ready yet, skipping move");
        return;
      }

      if (isEngineThinking) {
        console.log("Engine already thinking, skipping");
        return;
      }

      if (chessGame.isGameOver()) {
        console.log("Game is over, not making engine move");
        return;
      }

      console.log("Setting engine thinking to true");
      setIsEngineThinking(true);

      const { skillLevel, depth } = DIFFICULTY_LEVELS[difficultyIndex];

      try {
        console.log("Getting best move for position:", chessGame.fen());
        const bestMove = await getBestMove(chessGame.fen(), skillLevel, depth);
        console.log("Received best move:", bestMove);

        // Parse the move (format: e2e4)
        const from = bestMove.substring(0, 2) as Square;
        const to = bestMove.substring(2, 4) as Square;
        const promotion = bestMove.length > 4 ? bestMove[4] : 'q';

        console.log(`Making move: ${from} -> ${to} (promotion: ${promotion})`);
        const result = chessGame.move({ from, to, promotion });
        console.log("Move result:", result);

        setChessPosition(chessGame.fen());
        console.log("New position:", chessGame.fen());

        if (chessGame.isGameOver()) {
          setGameResult(getGameResult(chessGame));
        }
      } catch (error) {
        console.error("Error getting best move:", error);
      } finally {
        console.log("Setting engine thinking to false");
        setIsEngineThinking(false);
      }
    }

    function handleNewGame(color: 'w' | 'b' = playerColor) {
      chessGameRef.current.reset();
      setChessPosition(chessGameRef.current.fen());
      setGameResult(null);
      setMoveFrom('');
      setOptionSquares({});
      if (color === 'b') {
        setTimeout(() => makeEngineMove(), 300);
      }
    }

    function handleColorChange(color: 'w' | 'b') {
      setPlayerColor(color);
      handleNewGame(color);
    }

    async function getBestMove(fen: string, skillLevel: number, depth: number): Promise<string> {
      return new Promise((resolve, reject) => {
        if (!engineRef.current) {
          reject(new Error("Stockfish engine not initialized"));
          return;
        }

        const engine = engineRef.current as any;

        // Set up message handler
        const handleMessage = (msg: string) => {
          console.log("Stockfish says:", msg);

          if (typeof msg === 'string' && msg.startsWith("bestmove")) {
            const move = msg.split(" ")[1];
            console.log("Best move found:", move);
            engine.removeMessageListener(handleMessage);
            resolve(move);
          }
        };

        engine.addMessageListener(handleMessage);

        // Send commands to engine
        console.log("Sending to engine:", `position fen ${fen}`, `skill level ${skillLevel}`, `depth ${depth}`);
        engine.postMessage("ucinewgame");
        engine.postMessage(`setoption name Skill Level value ${skillLevel}`);
        engine.postMessage(`position fen ${fen}`);
        engine.postMessage(`go depth ${depth}`);
      });
    }

    // get the move options for a square to show valid moves
    function getMoveOptions(square: Square) {
      // get the moves for the square
      const moves = chessGame.moves({
        square,
        verbose: true,
      });

      // if no moves, clear the option squares
      if (moves.length === 0) {
        setOptionSquares({});
        return false;
      }

      // create a new object to store the option squares
      const newSquares: Record<string, React.CSSProperties> = {};

      // loop through the moves and set the option squares
      for (const move of moves) {
        newSquares[move.to] = {
          background:
            chessGame.get(move.to) &&
            chessGame.get(move.to)?.color !== chessGame.get(square)?.color
              ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)' // larger circle for capturing
              : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)', // smaller circle for moving
          borderRadius: '50%',
        };
      }

      // set the square clicked to move from to yellow
      newSquares[square] = {
        background: 'rgba(255, 255, 0, 0.4)',
      };

      // set the option squares
      setOptionSquares(newSquares);

      // return true to indicate that there are move options
      return true;
    }

    function onSquareClick({ square, piece }: SquareHandlerArgs) {
      // Don't allow moves while engine is thinking, game is over, or it's not player's turn
      if (isEngineThinking || gameResult !== null || chessGame.turn() !== playerColor) {
        return;
      }

      // piece clicked to move
      if (!moveFrom && piece) {
        // get the move options for the square
        const hasMoveOptions = getMoveOptions(square as Square);

        // if move options, set the moveFrom to the square
        if (hasMoveOptions) {
          setMoveFrom(square);
        }

        // return early
        return;
      }

      // square clicked to move to, check if valid move
      const moves = chessGame.moves({
        square: moveFrom as Square,
        verbose: true,
      });
      const foundMove = moves.find(
        (m) => m.from === moveFrom && m.to === square,
      );

      // not a valid move
      if (!foundMove) {
        // check if clicked on new piece
        const hasMoveOptions = getMoveOptions(square as Square);

        // if new piece, setMoveFrom, otherwise clear moveFrom
        setMoveFrom(hasMoveOptions ? square : '');

        // return early
        return;
      }

      // is normal move
      try {
        chessGame.move({
          from: moveFrom,
          to: square,
          promotion: 'q',
        });
      } catch {
        // if invalid, setMoveFrom and getMoveOptions
        const hasMoveOptions = getMoveOptions(square as Square);

        // if new piece, setMoveFrom, otherwise clear moveFrom
        if (hasMoveOptions) {
          setMoveFrom(square);
        }

        // return early
        return;
      }

      // update the position state
      setChessPosition(chessGame.fen());

      // clear moveFrom and optionSquares
      setMoveFrom('');
      setOptionSquares({});

      // check if game is over after player's move
      if (chessGame.isGameOver()) {
        setGameResult(getGameResult(chessGame));
        return;
      }

      // make Stockfish move after a short delay
      setTimeout(() => {
        makeEngineMove();
      }, 300);
    }

    // handle piece drop
    function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
      // Don't allow moves while engine is thinking, game is over, or it's not player's turn
      if (isEngineThinking || gameResult !== null || chessGame.turn() !== playerColor) {
        return false;
      }

      // type narrow targetSquare potentially being null (e.g. if dropped off board)
      if (!targetSquare) {
        return false;
      }

      // try to make the move according to chess.js logic
      try {
        chessGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q', // todo always promote to a queen for example simplicity
        });

        // update the position state upon successful move to trigger a re-render of the chessboard
        setChessPosition(chessGame.fen());

        // clear moveFrom and optionSquares
        setMoveFrom('');
        setOptionSquares({});

        // check if game is over after player's move
        if (chessGame.isGameOver()) {
          setGameResult(getGameResult(chessGame));
          return true;
        }

        // make Stockfish move after a short delay
        setTimeout(() => {
          makeEngineMove();
        }, 300);

        // return true as the move was successful
        return true;
      } catch {
        // return false as the move was not successful
        return false;
      }
    }

    // set the chessboard options
    const chessboardOptions = {
      onPieceDrop,
      onSquareClick,
      position: chessPosition,
      squareStyles: optionSquares,
      id: 'click-or-drag-to-move',
      boardOrientation: playerColor === 'w' ? 'white' : 'black' as 'white' | 'black',
    };

    // render the chessboard
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Engine strength
          </span>
          <div className="flex gap-2">
            {DIFFICULTY_LEVELS.map((level, index) => (
              <button
                key={level.label}
                onClick={() => setDifficultyIndex(index as DifficultyIndex)}
                disabled={isEngineThinking}
                className="px-3 py-1 rounded text-sm font-medium transition-all"
                style={{
                  background: difficultyIndex === index ? 'var(--primary-brand)' : 'transparent',
                  color: difficultyIndex === index ? '#fff' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: difficultyIndex === index ? 'var(--primary-brand)' : 'var(--text-muted)',
                  opacity: isEngineThinking ? 0.5 : 1,
                  cursor: isEngineThinking ? 'not-allowed' : 'pointer',
                }}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {!isEngineReady && (
          <div className="text-sm font-medium text-yellow-600">
            Loading Stockfish engine...
          </div>
        )}
        {isEngineReady && !isEngineThinking && (
          <div className="text-sm font-medium text-green-600">
            Engine ready - Your turn!
          </div>
        )}
        {isEngineThinking && (
          <div className="text-sm font-medium text-blue-600">
            Stockfish is thinking...
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Chessboard options={chessboardOptions} />
          {gameResult !== null && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                background: 'rgba(0, 0, 0, 0.72)',
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  color: '#fff',
                  fontSize: '22px',
                  fontWeight: '700',
                  textAlign: 'center',
                  padding: '0 24px',
                }}
              >
                {gameResult}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleNewGame(playerColor)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    background: 'var(--primary-brand)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  New Game
                </button>
                <button
                  disabled
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'not-allowed',
                  }}
                >
                  Analyse
                </button>
              </div>
            </div>
          )}
          </div>
          <button
            onClick={() => handleColorChange(playerColor === 'w' ? 'b' : 'w')}
            disabled={isEngineThinking}
            title={`Playing as ${playerColor === 'w' ? 'White' : 'Black'} — click to switch`}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: playerColor === 'w' ? 'rgba(255,255,255,0.85)' : 'rgba(30,30,30,0.85)',
              border: '2px solid rgba(128,128,128,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              lineHeight: 1,
              cursor: isEngineThinking ? 'not-allowed' : 'pointer',
              opacity: isEngineThinking ? 0.5 : 1,
              boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              flexShrink: 0,
            }}
          >
            {playerColor === 'w' ? '♔' : '♚'}
          </button>
        </div>
      </div>
    );
};

export default ChessGameBot;
