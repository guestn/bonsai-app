import { AnyToken } from '@pufferfinance/puffer-sdk';
import { tokenDecimals } from '@/utils/token-decimals';

export const convertTokenToBaseUnits = (
  value: number | bigint,
  token: AnyToken | 'ETH',
) => Number(value) / 10 ** tokenDecimals[token];

export const convertTokenFromBaseUnits = (
  value: number | bigint,
  token: AnyToken | 'ETH',
) => Number(value) * 10 ** tokenDecimals[token];
