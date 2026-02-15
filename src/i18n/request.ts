import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // For now, we'll use a simple locale detection
  // You can expand this to read from cookies, URL params, etc.
  const locale = 'en'; // Default locale

  return {
    locale,
    messages: (await import(`../locales/${locale}/common.json`)).default
  };
});
