import React, { useState } from "react";

interface TagHandlerProps {
  tags: string[];
  onTagChange: (tags: string[]) => void;
}

export default function TagHandler({ tags, onTagChange }: TagHandlerProps) {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagChange([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div>
      <label className="block mb-2" style={{ color: "var(--text)", fontWeight: "500" }}>
        Tags
      </label>

      {/* Tags Display */}
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
                onClick={() => handleRemoveTag(tag)}
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

      {/* Tag Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyUp={handleKeyPress}
          onKeyDown={handleKeyPress}
          placeholder="Add a tag..."
          style={{
            flex: "1",
            padding: "8px 12px",
            borderRadius: "6px",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            fontSize: "14px",
          }}
        />
        <button
          onClick={handleAddTag}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
