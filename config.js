/* config.js */
// Load .env file from the same directory and expose the Gemini API key to the page.
(async () => {
  try {
    const response = await fetch('.env');
    if (!response.ok) throw new Error('Failed to load .env');
    const text = await response.text();
    // .env format: KEY=VALUE (ignore comments and empty lines)
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=');
      if (key === 'GEMINI_API_KEY') {
        window.apiKey = value.trim();
        break;
      }
    }
  } catch (e) {
    console.error('Config load error:', e);
    // Keep window.apiKey undefined so the main script alerts the user.
  }
})();
