import { loadEnv } from 'vite';

const env = loadEnv('all', process.cwd());

const API_URLS = [env.VITE_SOME_API_URL];

const connectSrc = [
  "'self'",
  ...API_URLS,
  'https://firestore.googleapis.com',
  'https://api.merkl.xyz',
  // Google Analytics
  'https://*.googletagmanager.com',
  'https://*.google-analytics.com',
  // WalletConnect
  'wss://www.walletlink.org',
  'wss://*.walletconnect.com',
  'wss://*.walletconnect.org',
  'https://api.web3modal.org/',
  'https://*.walletconnect.org',
  'https://*.walletconnect.com',
  // Infura
  'https://mainnet.infura.io',
  // SimpleSVG
  'https://api.simplesvg.com',
  // Holesky RPC
  'https://ethereum-holesky-rpc.publicnode.com',
  'https://virtual.mainnet.rpc.tenderly.co',
  'https://gateway.holesky-safe.protofire.io',
  // Web3Modal
  'https://api.web3modal.com',
  // Safe wallet
  'https://safe-transaction-mainnet.safe.global',
  // HappyKit feature flags
  'https://happykit.dev',
  // Google Analytics
  'https://www.google-analytics.com',
  // Particle Wallet
  'https://*.particle.network',
  'https://cognito-identity.us-west-1.amazonaws.com',
  'https://kms.us-west-1.amazonaws.com',
  // Cloudflare
  'https://cloudflare-eth.com',
  // Misc
  'https://raw.githubusercontent.com',
];

const imgSrc = [
  "'self'",
  ...API_URLS,
  'blob:',
  'data:',
  'https://*.twimg.com https://*.1inch.io',
  'https://explorer-api.walletconnect.com',
  'https://static.particle.network',
  'https://raw.githubusercontent.com',
  'https://storage.googleapis.com',
];

const fontSrc = [
  "'self'",
  'data:',
  'https://fonts.gstatic.com',
  'https://rsms.me',
];

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
