export type ChainItem = {
  label: string;
  id: 'ETHEREUM' | 'SONEIUM';
  leadingIconSrc: string;
};

export const chainItems: { [key in ChainItem['id']]: ChainItem } = {
  ETHEREUM: {
    label: 'Ethereum',
    id: 'ETHEREUM',
    leadingIconSrc: '/icons/chains/ethereum.svg',
  },
  SONEIUM: {
    label: 'Soneium',
    id: 'SONEIUM',
    leadingIconSrc: '/icons/chains/soneium.svg',
  },
};
