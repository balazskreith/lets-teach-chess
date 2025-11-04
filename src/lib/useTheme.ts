"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem("theme") as Theme || "system";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      let newResolvedTheme: "light" | "dark";

      if (theme === "system") {
        newResolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        newResolvedTheme = theme;
      }

      setResolvedTheme(newResolvedTheme);

      // Update document class
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newResolvedTheme);

      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          "content",
          newResolvedTheme === "dark" ? "#020617" : "#ffffff"
        );
      }
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        updateTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setThemeWithStorage = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    if (resolvedTheme === "light") {
      setThemeWithStorage("dark");
    } else {
      setThemeWithStorage("light");
    }
  };

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeWithStorage,
    toggleTheme,
  };
} 