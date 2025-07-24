// Development configuration
export const DEV_CONFIG = {
  // Set to true to force using mock data instead of Firebase
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',

  // Set to true to enable debug logging
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
};

// Helper function to check if we should use mock data
export const shouldUseMockData = () => {
  return DEV_CONFIG.USE_MOCK_DATA;
};
