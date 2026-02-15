export const locales = ['en', 'pl', 'de', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  pl: 'Polski',
  de: 'Deutsch',
  es: 'Español'
};
