export const formatDid = (did: string | undefined) => {
  if (!did) return '';

  return `${did.slice(0, 4)}...${did.slice(did.length - 5)}`;
};

export const formatKey = (key: string) => {
  return `${key.slice(0, 4)}...${key.slice(key.length - 5)}`;
};

export const formatBalance = (balance: string, decimals = 2) =>
  Number(balance).toFixed(decimals);
