"use client";

import React, { useState } from "react";
import { locales, localeNames, type Locale } from "../i18n/config";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export default function LanguageSwitcher({ currentLocale, onLocaleChange }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 16px",
          borderRadius: "6px",
          background: "var(--surface)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        🌐 {localeNames[currentLocale]}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            minWidth: "120px",
            zIndex: 1000,
          }}
        >
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => {
                onLocaleChange(locale);
                setIsOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: locale === currentLocale ? "rgba(255,255,255,0.1)" : "transparent",
                color: "var(--text)",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                textAlign: "left",
                fontWeight: locale === currentLocale ? "600" : "400",
              }}
            >
              {localeNames[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
