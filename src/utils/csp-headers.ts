import { loadEnv } from 'vite';

const env = loadEnv('all', process.cwd());

const API_URLS = [env.VITE_SOME_API_URL];

const connectSrc = [
  "'self'",
  ...API_URLS,
  'https://firestore.googleapis.com',
  // Google Analytics
  'https://*.googletagmanager.com',
  'https://*.google-analytics.com',
  // Misc
  'https://raw.githubusercontent.com',
];

const imgSrc = [
  "'self'",
  ...API_URLS,
  'blob:',
  'data:',
  'https://images.unsplash.com',
  'https://raw.githubusercontent.com',
  'https://storage.googleapis.com',
];

const fontSrc = ["'self'", 'data:', 'https://fonts.gstatic.com'];

const scriptSrc = [
  "'self'",
  "'unsafe-eval'",
  "'unsafe-inline'",
  'https://www.googletagmanager.com',
];

const frameSrc = [
  'https://verify.walletconnect.com',
  'https://*.walletconnect.org',
];

const frameAncestors = ['https://*.walletconnect.org'];

const styleSrc = ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'];

export const cspHeaders = [
  "default-src 'self'",
  `script-src ${scriptSrc.join(' ')}`,
  `style-src ${styleSrc.join(' ')}`,
  `img-src ${imgSrc.join(' ')}`,
  `connect-src ${connectSrc.join(' ')}`,
  `font-src ${fontSrc.join(' ')}`,
  `frame-src ${frameSrc.join(' ')}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  `frame-ancestors ${frameAncestors.join(' ')}`,
  'block-all-mixed-content',
  'upgrade-insecure-requests',
].join('; ');
