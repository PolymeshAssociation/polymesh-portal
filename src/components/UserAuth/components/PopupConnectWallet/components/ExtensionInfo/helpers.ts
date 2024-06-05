import { SUPPORTED_BROWSERS } from '../../../../constants';

export const isSupportedBrowser = (walletName: string) => {
  const { userAgent } = navigator;
  const selectedWalletBrowsers = SUPPORTED_BROWSERS[walletName];

  return selectedWalletBrowsers.tickers.some((browser) =>
    userAgent.includes(browser),
  );
};
