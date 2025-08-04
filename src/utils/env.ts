export const env = {
  ...import.meta.env,
  VITE_AUTHORIZED_EMAIL: import.meta.env.VITE_AUTHORIZED_EMAIL || '',
  VITE_GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};
