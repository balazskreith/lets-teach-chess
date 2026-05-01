import React, { useEffect, useState } from "react";

interface TagHandlerProps {
  tags: string[];
  onTagChange: (tags: string[]) => void;
}

export default function TagHandler({ tags, onTagChange }: TagHandlerProps) {
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/puzzles?distinctThemes=true')
      .then((r) => r.json())
      .then((data) => setAvailableThemes(data.themes ?? []))
      .catch(() => {});
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected && !tags.includes(selected)) {
      onTagChange([...tags, selected]);
    }
    e.target.value = "";
  };

  const handleRemove = (tag: string) => {
    onTagChange(tags.filter((t) => t !== tag));
  };

  const unselected = availableThemes.filter((t) => !tags.includes(t));

  return (
    <div>
      <label className="block mb-2" style={{ color: "var(--text)", fontWeight: "500" }}>
        Tags
      </label>

      {/* Selected tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                background: "var(--primary-brand)",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: "16px",
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {tag}
              <button
                onClick={() => handleRemove(tag)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "16px",
                  lineHeight: "1",
                  padding: "0",
                  marginLeft: "2px",
                }}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Theme dropdown */}
      <select
        onChange={handleSelect}
        defaultValue=""
        disabled={unselected.length === 0}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: "6px",
          background: "rgba(255,255,255,0.03)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          fontSize: "14px",
          cursor: unselected.length === 0 ? "not-allowed" : "pointer",
        }}
      >
        <option value="" disabled>
          {unselected.length === 0 ? "All themes selected" : "Select a theme…"}
        </option>
        {unselected.map((theme) => (
          <option key={theme} value={theme}>
            {theme}
          </option>
        ))}
      </select>
    </div>
  );
}
