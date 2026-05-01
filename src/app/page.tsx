"use client";

import React, { useState } from "react";
import ChessGameBot from "./../components/play/ChessGameBot";
import GameViewer from "../components/great-games/GameViewer";
import PuzzleBoard from "./../components/viewer/PuzzleBoard";
import LanguageSwitcher from "./../components/common/LanguageSwitcher";
import { useLocale } from "@/hooks/useLocale";

function App() {
  const [activeTab, setActiveTab] = useState<"play" | "viewer" | "greatGames">("play");
  const { currentLocale, setLocale } = useLocale();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
      {/* Language Switcher - Top Right */}
      <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 100 }}>
        <LanguageSwitcher currentLocale={currentLocale} onLocaleChange={setLocale} />
      </div>

      {/* Title and Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6" style={{ paddingRight: "140px" }}>
        <h1
          className="text-5xl font-bold"
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
        {/* <p className="text-lg" style={{ color: "var(--text-muted)" }}>
          Play and analyze chess
        </p> */}

        {/* Tab Navigation */}
        <div
          className="flex gap-2 p-1"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 10,
            border: "1px solid var(--border)",
          }}
        >
        <button
          onClick={() => setActiveTab("play")}
          className={`py-3 px-6 rounded-lg transition-all ${activeTab === "play" ? "font-semibold" : ""}`}
          style={{
            background: activeTab === "play" ? "var(--primary-brand)" : "transparent",
            color: activeTab === "play" ? "#fff" : "var(--text-muted)",
            border: "none",
            fontSize: 15,
          }}
        >
          Play vs Stockfish
        </button>
        <button
          onClick={() => setActiveTab("viewer")}
          className={`py-3 px-6 rounded-lg transition-all ${activeTab === "viewer" ? "font-semibold" : ""}`}
          style={{
            background: activeTab === "viewer" ? "var(--primary-brand)" : "transparent",
            color: activeTab === "viewer" ? "#fff" : "var(--text-muted)",
            border: "none",
            fontSize: 15,
          }}
        >
          PGN Viewer
        </button>
        <button
          onClick={() => setActiveTab("greatGames")}
          className={`py-3 px-6 rounded-lg transition-all ${activeTab === "greatGames" ? "font-semibold" : ""}`}
          style={{
            background: activeTab === "greatGames" ? "var(--primary-brand)" : "transparent",
            color: activeTab === "greatGames" ? "#fff" : "var(--text-muted)",
            border: "none",
            fontSize: 15,
          }}
        >
          Great Games
        </button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          width: activeTab === "viewer" || activeTab === "greatGames" ? "min(1200px, 95vw)" : "min(600px, 90vw)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          borderRadius: 8,
        }}
      >
        {activeTab === "play" ? (
          <div>
            <ChessGameBot />
          </div>
        ) : activeTab === "viewer" ? (
          <div style={{ padding: "20px" }}>
            <PuzzleBoard />
          </div>
        ) : (
          <div>
            <GameViewer />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
