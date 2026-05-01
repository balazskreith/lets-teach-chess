export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeDatabase } = await import('./lib/db-init');
    await initializeDatabase();

    const { getDistinctThemes } = await import('./components/common/puzzleRepository');
    getDistinctThemes().catch(console.error); // warm cache without blocking startup
  }
}
