import { Token, UnifiToken } from '@pufferfinance/puffer-sdk';

export type UnifiTokenItem = {
  label: string;
  id: UnifiToken;
  leadingIconSrc: string;
};

export type TokenItem = {
  label: string;
  id: UnifiToken | Token | 'ETH' | 'NUCLEUS' | 'TAC' | 'CONCRETE';
  leadingIconSrc: string;
};

export const tokenItems: { [key in TokenItem['id']]: TokenItem } = {
  USDT: {
    label: 'USDT',
    id: Token.USDT,
    leadingIconSrc: '/icons/tokens/USDT.svg',
  },
  USDC: {
    label: 'USDC',
    id: Token.USDC,
    leadingIconSrc: '/icons/tokens/USDC.svg',
  },
  DAI: {
    label: 'DAI',
    id: Token.DAI,
    leadingIconSrc: '/icons/tokens/DAI.svg',
  },
  ETH: {
    label: 'ETH',
    id: 'ETH',
    leadingIconSrc: '/icons/tokens/ETH.svg',
  },
  WETH: {
    label: 'WETH',
    id: Token.WETH,
    leadingIconSrc: '/icons/tokens/WETH.svg',
  },
  stETH: {
    label: 'stETH',
    id: Token.stETH,
    leadingIconSrc: '/icons/tokens/stETH.svg',
  },
  wstETH: {
    label: 'wstETH',
    id: Token.wstETH,
    leadingIconSrc: '/icons/tokens/wstETH.svg',
  },
  ALT: {
    label: 'ALT',
    id: Token.ALT,
    leadingIconSrc: '/icons/tokens/ALT.svg',
  },
  eETH: {
    label: 'eETH',
    id: Token.eETH,
    leadingIconSrc: '/icons/tokens/eETH.svg',
  },
  cbETH: {
    label: 'cbETH',
    id: Token.cbETH,
    leadingIconSrc: '/icons/tokens/cbETH.svg',
  },
  pufETHwstE: {
    label: 'pufETHwstE',
    id: Token.pufETHwstE,
    leadingIconSrc: '/icons/tokens/pufETHwstE.svg',
  },
  pufETH: {
    label: 'pufETH',
    id: Token.pufETH,
    leadingIconSrc: '/icons/tokens/pufETH.svg',
  },
  xPufETH: {
    label: 'xPufETH',
    id: Token.xPufETH,
    leadingIconSrc: '/icons/tokens/pufETH.svg',
  },
  ctTACpufETH: {
    label: 'ctTACpufETH',
    id: Token.ctTACpufETH,
    leadingIconSrc: '/icons/tokens/ctTACpufETH.svg',
  },
  WBTC: {
    label: 'WBTC',
    id: Token.WBTC,
    leadingIconSrc: '/icons/tokens/wBTC.svg',
  },
  LBTC: {
    label: 'LBTC',
    id: Token.LBTC,
    leadingIconSrc: '/icons/tokens/LBTC.svg',
  },
  tBTC: {
    label: 'tBTC',
    id: Token.tBTC,
    leadingIconSrc: '/icons/tokens/tBTC.svg',
  },
  cbBTC: {
    label: 'cbBTC',
    id: Token.cbBTC,
    leadingIconSrc: '/icons/tokens/cbBTC.png',
  },
  pumpBTC: {
    label: 'pumpBTC',
    id: Token.pumpBTC,
    leadingIconSrc: '/icons/tokens/pumpBTC.svg',
  },
  SolvBTC: {
    label: 'SolvBTC',
    id: Token.SolvBTC,
    leadingIconSrc: '/icons/tokens/SolvBTC.svg',
  },
  PUFFER: {
    label: 'PUFFER',
    id: Token.PUFFER,
    leadingIconSrc: '/icons/tokens/PUFFER.svg',
  },
  vePUFFER: {
    label: 'vePUFFER',
    id: Token.vePUFFER,
    leadingIconSrc: '/icons/tokens/PUFFER.svg',
  },
  CARROT: {
    label: 'CARROT',
    id: Token.CARROT,
    leadingIconSrc: '/icons/tokens/CARROT.svg',
  },
  mtwCARROT: {
    label: 'mtwCARROT',
    id: Token.mtwCARROT,
    leadingIconSrc: '/icons/tokens/CARROT.svg',
  },
  sCARROT: {
    label: 'sCARROT',
    id: Token.sCARROT,
    leadingIconSrc: '/icons/tokens/sCARROT.svg',
  },
  lvlUSD: {
    label: 'lvlUSD',
    id: Token.lvlUSD,
    leadingIconSrc: '/icons/tokens/lvlUSD.svg',
  },
  slvlUSD: {
    label: 'slvlUSD',
    id: Token.slvlUSD,
    leadingIconSrc: '/icons/tokens/slvlUSD.svg',
  },
  LINK: {
    label: 'LINK',
    id: Token.LINK,
    leadingIconSrc: '/icons/tokens/LINK.svg',
  },
  TEST: {
    label: 'TEST',
    id: Token.TEST,
    leadingIconSrc: '/images/logos/everclear-dark.svg',
  },
  // UniFi Tokens
  unifiETH: {
    label: 'unifiETH',
    id: UnifiToken.unifiETH,
    leadingIconSrc: '/icons/tokens/unifiETH.svg',
  },
  unifiUSD: {
    label: 'unifiUSD',
    id: UnifiToken.unifiUSD,
    leadingIconSrc: '/icons/vaults/usd-vault.svg',
  },
  unifiBTC: {
    label: 'unifiBTC',
    id: UnifiToken.unifiBTC,
    leadingIconSrc: '/icons/vaults/btc-vault.svg',
  },
  pufETHs: {
    label: 'pufETHs',
    id: UnifiToken.pufETHs,
    leadingIconSrc: '/icons/tokens/pufETHs.svg',
  },
  // Below are not strictly tokens but rewards
  NUCLEUS: {
    label: 'NUCLEUS',
    id: 'NUCLEUS',
    leadingIconSrc: '/icons/tokens/nucleus.svg',
  },
  TAC: {
    label: 'TAC',
    id: 'TAC',
    leadingIconSrc: '/icons/tokens/tac.png',
  },
  CONCRETE: {
    label: 'CONCRETE',
    id: 'CONCRETE',
    leadingIconSrc: '/icons/tokens/concrete.png',
  },
};
