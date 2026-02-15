"use client";

import React, { useState, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { defaultLocale, type Locale } from "../i18n/config";

export default function IntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    // Load locale from localStorage on mount
    const savedLocale = localStorage.getItem("locale") as Locale;
    if (savedLocale) {
      setLocale(savedLocale);
    }
  }, []);

  useEffect(() => {
    // Load messages when locale changes
    const loadMessages = async () => {
      const msgs = await import(`../locales/${locale}/common.json`);
      setMessages(msgs.default);
    };
    loadMessages();

    // Listen for locale changes from other components
    const handleLocaleChange = (event: CustomEvent) => {
      setLocale(event.detail);
    };

    window.addEventListener('localeChange', handleLocaleChange as EventListener);
    return () => {
      window.removeEventListener('localeChange', handleLocaleChange as EventListener);
    };
  }, [locale]);

  if (!messages) {
    return null; // or a loading spinner
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
