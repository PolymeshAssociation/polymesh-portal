// The Transactions and Movements tables have eight columns, so Name and Memo
// stay on one line to keep each table inside its card
export const NAME_MAX_WIDTH = 100;
export const MEMO_MAX_WIDTH = 90;

export const formatNameAndTicker = (
  tokenDetails: { name: string; ticker?: string } | undefined,
) =>
  tokenDetails
    ? `${tokenDetails.name}${tokenDetails.ticker ? ` (${tokenDetails.ticker})` : ''}`
    : null;
