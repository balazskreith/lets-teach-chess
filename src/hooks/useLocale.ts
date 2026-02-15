"use client";

import { useState, useEffect } from "react";
import { defaultLocale, type Locale } from "../i18n/config";

export function useLocale() {
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    // Load locale from localStorage on mount
    const savedLocale = localStorage.getItem("locale") as Locale;
    if (savedLocale) {
      setCurrentLocale(savedLocale);
    }
  }, []);

  const setLocale = (locale: Locale) => {
    setCurrentLocale(locale);
    localStorage.setItem("locale", locale);
    // Force reload messages by dispatching custom event
    window.dispatchEvent(new CustomEvent('localeChange', { detail: locale }));
  };

  return { currentLocale, setLocale };
}
