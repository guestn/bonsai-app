import {
  Token,
  Chain,
  TOKENS_ADDRESSES,
  UnifiToken,
} from '@pufferfinance/puffer-sdk';

export const buildTokensAddressMap = <T extends Token | UnifiToken>(
  tokens: T[],
  chain: Chain = Chain.Mainnet,
) => {
  return tokens.reduce<{ [tokenAddress: string]: T }>((acc, t: T) => {
    acc[TOKENS_ADDRESSES[t][chain]] = t;
    return acc;
  }, {});
};
