"use client";

import React from "react";
import { Chessboard } from "react-chessboard";

// Tomasz experiments can play with a bot with ClickOrDragToMove component
// source https://github.com/Clariity/react-chessboard/tree/main/docs
// import PGNViewer from "./../components/PGNViewer";
import ClickOrDragToMove from "./../components/ClickOrDragToMove";

// //for pgnviewer
// const samplePgn = `
// [Event "Example"]
// [Site "ChatGPT"]
// [Date "2025.10.30"]
// [Round "-"]
// [White "User"]
// [Black "ChatGPT"]
// [Result "1-0"]
//
// 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 1-0
// `;
//
//
function App() {
  return (
    <div style={{
                   width: "min(600px, 90vw)",
                   boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                   borderRadius: 8,
                 }}>
      <h2 style={{ textAlign: "center" }}>Chessboard Example</h2>
      <ClickOrDragToMove />
    </div>
  );
}

export default App;
//
// export default function Page() {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
//       {/* Title */}
//       <div className="text-center">
//         <h1
//           className="text-5xl font-bold mb-3"
//           style={{
//             color: "var(--text)",
//             background: "linear-gradient(135deg, var(--primary-brand), var(--accent-brand))",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//             backgroundClip: "text",
//           }}
//         >
//           ♔ Tomasz Chess ♚
//         </h1>
//         <p className="text-lg" style={{ color: "var(--text-muted)" }}>
//           Teach and play chess online with friends
//         </p>
//       </div>
//
//       {/* Chess Board */}
//       <div
//         style={{
//           width: "min(600px, 90vw)",
//           boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
//           borderRadius: 8,
//         }}
//       >
//         <Chessboard />
//       </div>
//
//       {/* Footer info */}
//       <div
//         className="text-center text-sm"
//         style={{
//           color: "var(--text-muted)",
//         }}
//       >
//         Click and drag pieces to move them
//       </div>
//     </div>
//   );
// }
