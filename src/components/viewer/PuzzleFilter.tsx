"use client";

import React, { useEffect, useState } from "react";

export interface PuzzleFilters {
  minRating: number | null;
  maxRating: number | null;
  theme: string | null;
}

interface PuzzleFilterProps {
  onApply: (filters: PuzzleFilters) => void;
}

const inputStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: "6px",
  background: "rgba(255,255,255,0.03)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  fontSize: "14px",
};

export default function PuzzleFilter({ onApply }: PuzzleFilterProps) {
  const [themes, setThemes] = useState<string[]>([]);
  const [draftMin, setDraftMin] = useState("");
  const [draftMax, setDraftMax] = useState("");
  const [draftTheme, setDraftTheme] = useState("");
  const [applied, setApplied] = useState<PuzzleFilters>({ minRating: null, maxRating: null, theme: null });

  useEffect(() => {
    fetch('/api/puzzles?distinctThemes=true')
      .then((r) => r.json())
      .then((data) => setThemes(data.themes ?? []))
      .catch(() => {});
  }, []);

  const handleApply = () => {
    const filters: PuzzleFilters = {
      minRating: draftMin !== "" ? parseInt(draftMin, 10) : null,
      maxRating: draftMax !== "" ? parseInt(draftMax, 10) : null,
      theme: draftTheme || null,
    };
    setApplied(filters);
    onApply(filters);
  };

  const handleClear = () => {
    setDraftMin("");
    setDraftMax("");
    setDraftTheme("");
    const empty: PuzzleFilters = { minRating: null, maxRating: null, theme: null };
    setApplied(empty);
    onApply(empty);
  };

  const isActive = applied.minRating !== null || applied.maxRating !== null || applied.theme !== null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
      {/* Theme filter */}
      <select
        value={draftTheme}
        onChange={(e) => setDraftTheme(e.target.value)}
        style={{ ...inputStyle, width: "160px" }}
      >
        <option value="">All themes</option>
        {themes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* Rating range */}
      <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Rating:</span>
      <input
        type="number"
        placeholder="Min"
        value={draftMin}
        onChange={(e) => setDraftMin(e.target.value)}
        style={{ ...inputStyle, width: "80px" }}
      />
      <span style={{ color: "var(--text-muted)" }}>–</span>
      <input
        type="number"
        placeholder="Max"
        value={draftMax}
        onChange={(e) => setDraftMax(e.target.value)}
        style={{ ...inputStyle, width: "80px" }}
      />

      <button
        onClick={handleApply}
        style={{
          padding: "6px 14px",
          borderRadius: "6px",
          background: "var(--primary-brand)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Apply
      </button>

      {isActive && (
        <button
          onClick={handleClear}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            background: "var(--surface)",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
