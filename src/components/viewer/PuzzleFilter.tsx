"use client";

import React, { useEffect, useState } from "react";
import type { ThemeOption } from "@/components/common/puzzleRepository";

export interface PuzzleFilters {
  minRating: number | null;
  maxRating: number | null;
  themes: string[];
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

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "3px 8px",
  borderRadius: "12px",
  background: "var(--primary-brand)",
  color: "#fff",
  fontSize: "13px",
};

export default function PuzzleFilter({ onApply }: PuzzleFilterProps) {
  const [availableThemes, setAvailableThemes] = useState<ThemeOption[]>([]);
  const [draftMin, setDraftMin] = useState("");
  const [draftMax, setDraftMax] = useState("");
  const [draftThemes, setDraftThemes] = useState<string[]>([]);
  const [applied, setApplied] = useState<PuzzleFilters>({ minRating: null, maxRating: null, themes: [] });

  useEffect(() => {
    fetch('/api/puzzles?distinctThemes=true')
      .then((r) => r.json())
      .then((data) => setAvailableThemes(data.themes ?? []))
      .catch(() => {});
  }, []);

  const addTheme = (t: string) => {
    if (t && !draftThemes.includes(t)) {
      setDraftThemes([...draftThemes, t]);
    }
  };

  const removeTheme = (t: string) => {
    setDraftThemes(draftThemes.filter((x) => x !== t));
  };

  const handleApply = () => {
    const filters: PuzzleFilters = {
      minRating: draftMin !== "" ? parseInt(draftMin, 10) : null,
      maxRating: draftMax !== "" ? parseInt(draftMax, 10) : null,
      themes: draftThemes,
    };
    setApplied(filters);
    onApply(filters);
  };

  const handleClear = () => {
    setDraftMin("");
    setDraftMax("");
    setDraftThemes([]);
    const empty: PuzzleFilters = { minRating: null, maxRating: null, themes: [] };
    setApplied(empty);
    onApply(empty);
  };

  const isActive = applied.minRating !== null || applied.maxRating !== null || applied.themes.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
        {/* Theme selector */}
        <select
          value=""
          onChange={(e) => { addTheme(e.target.value); (e.target as HTMLSelectElement).value = ""; }}
          style={{ ...inputStyle, width: "160px" }}
        >
          <option value="">Add theme…</option>
          {availableThemes.filter((t) => !draftThemes.includes(t.slug)).map((t) => (
            <option key={t.slug} value={t.slug}>{t.label}</option>
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

      {/* Selected theme chips */}
      {draftThemes.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {draftThemes.map((slug) => {
            const label = availableThemes.find((t) => t.slug === slug)?.label ?? slug;
            return (
              <span key={slug} style={chipStyle}>
                {label}
                <button
                  onClick={() => removeTheme(slug)}
                  style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "0", lineHeight: 1, fontSize: "15px" }}
                  aria-label={`Remove ${label}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
