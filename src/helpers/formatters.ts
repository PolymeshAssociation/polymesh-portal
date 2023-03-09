export const formatDid = (
  did: string | undefined,
  startChars = 4,
  endChars = 5,
) => {
  if (!did) return '';

  return `${did.slice(0, startChars)}...${did.slice(did.length - endChars)}`;
};

export const formatKey = (key: string, startChars = 4, endChars = 5) => {
  return `${key.slice(0, startChars)}...${key.slice(key.length - endChars)}`;
};

export const formatBalance = (balance: string, decimals = 2) =>
  Number(balance).toFixed(decimals);
