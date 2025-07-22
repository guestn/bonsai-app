import { AnyToken, Token, UnifiToken } from '@pufferfinance/puffer-sdk';

// The decimals are hard-coded to avoid making an extra call to the
// contract and handling the loading and error states. Decimals can be
// taken from the `TokenContract.decimals()` method of each token
// contract. For example, for USDC:
// https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48#readProxyContract#F11
export const tokenDecimals: {
  [token in AnyToken | 'ETH' | 'NUCLEUS']: number;
} = {
  [Token.USDT]: 6,
  [Token.USDC]: 6,
  [Token.DAI]: 18,
  [Token.WETH]: 18,
  [Token.stETH]: 18,
  [Token.wstETH]: 18,
  [Token.ALT]: 18,
  [Token.eETH]: 18,
  [Token.cbETH]: 18,
  [Token.pufETHwstE]: 18,
  [Token.pufETH]: 18,
  [Token.xPufETH]: 18,
  [Token.ctTACpufETH]: 27,
  [Token.WBTC]: 8,
  [Token.LBTC]: 8,
  [Token.tBTC]: 18,
  [Token.cbBTC]: 8,
  [Token.pumpBTC]: 8,
  [Token.SolvBTC]: 18,
  [Token.PUFFER]: 18,
  [Token.vePUFFER]: 18,
  [Token.CARROT]: 18,
  [Token.mtwCARROT]: 18,
  [Token.sCARROT]: 18,
  [Token.lvlUSD]: 18,
  [Token.slvlUSD]: 18,
  [Token.LINK]: 18,
  [Token.TEST]: 18,
  [UnifiToken.unifiETH]: 18,
  [UnifiToken.unifiUSD]: 6,
  [UnifiToken.unifiBTC]: 8,
  [UnifiToken.pufETHs]: 18,
  ETH: 18,
  NUCLEUS: 18,
};
