import { BareFetcher } from 'swr';
import axios from 'axios';
import { env } from '@/utils/env';

export const ROOT_API_URL = env.BASE_URL;

export const mainFetcher: BareFetcher<any> = async (options) => {
  const res = await axios({ baseURL: ROOT_API_URL, ...options });
  return res.data;
};
