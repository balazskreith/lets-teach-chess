import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

const PGNViewer: React.FC<{ pgn: string }> = ({ pgn }) => {
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState("start");

  useEffect(() => {
    // Load PGN into the chess engine
    chess.loadPgn(pgn);

    // Get the final position from the PGN
    setFen(chess.fen());
  }, [pgn]);
   console.log('AA ' + chess.fen() + ' bb ' + fen);

  return (
    <div className="flex flex-col items-center">
      <Chessboard options={{ position: fen }} />
    </div>
  );
};

export default PGNViewer;
