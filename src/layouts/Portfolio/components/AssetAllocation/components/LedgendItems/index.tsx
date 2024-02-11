import { useState } from 'react';
import { formatBalance } from '~/helpers/formatters';
import { StyledExpandedOtherAssets, StyledLegendItem } from './styles';
import { IAssetOption } from '../../constants';

export const LegendItems = ({ assets }: { assets: IAssetOption[] }) => {
  const [otherAssetsExpanded, setOtherAssetsExpanded] = useState(false);
  const formatBalancePercentage = (percentage: number) =>
    formatBalance(percentage, 2);
  // only show the tickers with the largest holding count, remaining tickers will
  // be grouped under other.
  const maxTickersToShow = 4;

  if (assets.length <= maxTickersToShow) {
    return assets.map(({ ticker, color, percentage }) => (
      <StyledLegendItem key={ticker} $color={color}>
        {ticker}
        <span>{formatBalancePercentage(percentage)}%</span>
      </StyledLegendItem>
    ));
  }
  // We will count "Other" as the last ticker so split at `maxTickersToShow - 1`
  const assetsToShow = assets.slice(0, maxTickersToShow - 1);
  const otherAssets = assets.slice(maxTickersToShow - 1);

  const otherPercentage = otherAssets.reduce(
    (sum, option) => sum + option.percentage,
    0,
  );

  return (
    <>
      {assetsToShow.map(({ ticker, color, percentage }) => (
        <StyledLegendItem key={ticker} $color={color}>
          {ticker}
          <span>{formatBalancePercentage(percentage)}%</span>
        </StyledLegendItem>
      ))}
      <StyledLegendItem
        key="Other"
        $color="#EC4673"
        $expandable
        onMouseEnter={() => setOtherAssetsExpanded(true)}
        onMouseLeave={() => setOtherAssetsExpanded(false)}
      >
        Other
        <span>{formatBalancePercentage(otherPercentage)}%</span>
        {otherAssetsExpanded && (
          <StyledExpandedOtherAssets>
            {otherAssets.map((option) => (
              <StyledLegendItem key={option.ticker} $color={option.color}>
                {option.ticker}
                <span>{formatBalancePercentage(option.percentage)}%</span>
              </StyledLegendItem>
            ))}
          </StyledExpandedOtherAssets>
        )}
      </StyledLegendItem>
    </>
  );
};
