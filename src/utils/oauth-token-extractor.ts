// Global OAuth token extraction utility
// This runs on every page load to extract Google Drive OAuth tokens

console.info('🔍 Global OAuth token extractor running...');

// Function to extract OAuth tokens from URL hash
function extractOAuthToken(): void {
  try {
    // Check if we're returning from OAuth (look for token in URL hash)
    const fragment = window.location.hash.substring(1);

    if (!fragment) {
      console.info('No URL hash found');
      return;
    }

    console.info('URL hash found:', fragment);

    const hashParams = new URLSearchParams(fragment);
    const accessToken = hashParams.get('access_token');
    const state = hashParams.get('state');

    console.info('Access token found:', !!accessToken);
    console.info('State found:', state);
    console.info(
      'State format:',
      state?.startsWith('google-drive-auth:')
        ? '✅ Correct'
        : '❌ Wrong format',
    );

    if (accessToken && state?.startsWith('google-drive-auth:')) {
      console.info('✅ Found OAuth token in URL hash');
      console.info('Token length:', accessToken.length);
      console.info('Token preview:', accessToken.substring(0, 20) + '...');

      // Store the token in sessionStorage
      sessionStorage.setItem('google_drive_access_token', accessToken);
      console.info('✅ Token stored in sessionStorage');
      console.info('SessionStorage keys:', Object.keys(sessionStorage));

      // Clean up the URL hash
      window.history.replaceState({}, document.title, window.location.pathname);
      console.info('✅ URL hash cleaned up');

      // Extract the original page from the state if needed
      const originalPage = state.substring('google-drive-auth:'.length);
      if (originalPage && originalPage !== window.location.pathname) {
        console.info('Original page was:', originalPage);
        console.info('Current page is:', window.location.pathname);
      }
    } else {
      console.info('❌ No valid OAuth token found in URL hash');
    }
  } catch (error) {
    console.error('Error extracting OAuth token:', error);
  }
}

// Run token extraction when the page loads
if (document.readyState === 'loading') {
  // Page is still loading, wait for DOMContentLoaded
  document.addEventListener('DOMContentLoaded', extractOAuthToken);
} else {
  // Page is already loaded, run immediately
  extractOAuthToken();
}

// Also run on hashchange events (in case the hash changes after page load)
window.addEventListener('hashchange', extractOAuthToken);

console.info('✅ Global OAuth token extractor initialized');
