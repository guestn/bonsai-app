export type PufferBffRouteKeys =
  | 'TVL_ALL'
  | 'AWARD_RATES'
  | 'TOKEN_PRICE'
  | 'NUCLEUS_APY';

export const pufferBffApiRoutes: { [key in PufferBffRouteKeys]: string } = {
  TVL_ALL: 'tvl/all',
  AWARD_RATES: 'airdrop/award-rates',
  TOKEN_PRICE: 'token-price/prices',
  NUCLEUS_APY: 'nucleus-apy',
};
