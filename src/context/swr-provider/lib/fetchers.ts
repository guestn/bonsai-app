import { BareFetcher } from 'swr';
import axios from 'axios';
import { env } from '@/utils/env';

export const PUFFER_BFF_API_ROOT = env.VITE_PUFFER_BFF_API_URL;

export const pufferBffFetcher: BareFetcher<any> = async (options) => {
  const res = await axios({ baseURL: PUFFER_BFF_API_ROOT, ...options });
  return res.data;
};
