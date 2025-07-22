export const truncateAddress = (address: string | undefined, chars = 8) => {
  if (!address) return '';

  const start = address.slice(0, Math.floor(chars * 0.5));
  const end = address.slice(-Math.floor(chars * 0.5));

  return `${start}...${end}`;
};
