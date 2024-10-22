import { useState, useEffect } from 'react';
import { formatBalance } from '~/helpers/formatters';
import { StyledExpandedOtherAssets, StyledLegendItem } from './styles';
import { IAssetOption } from '../../constants';

export const LegendItems = ({ assets }: { assets: IAssetOption[] }) => {
  const [otherAssetsExpanded, setOtherAssetsExpanded] = useState(false);
  const [assetNames, setAssetNames] = useState<Record<string, string>>({}); // To store asset names

  const formatBalancePercentage = (percentage: number) =>
    formatBalance(percentage, 2);

  const maxTickersToShow = 4;

  // Fetch asset names and store them in state
  useEffect(() => {
    const fetchAssetNames = async () => {
      const names: Record<string, string> = {};
      await Promise.all(
        assets.map(async ({ assetId, asset }) => {
          const { name } = await asset.details();
          names[assetId] = name;
        }),
      );
      setAssetNames(names);
    };
    fetchAssetNames();
  }, [assets]);

  if (assets.length <= maxTickersToShow) {
    return (
      <>
        {assets.map(({ assetId, color, percentage }) => {
          const assetName = assetNames[assetId] || assetId;
          return (
            <StyledLegendItem key={assetId} $color={color}>
              {assetName}
              <span>{formatBalancePercentage(percentage)}%</span>
            </StyledLegendItem>
          );
        })}
      </>
    );
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
      {assetsToShow.map(({ assetId, color, percentage }) => {
        const assetName = assetNames[assetId] || assetId;
        return (
          <StyledLegendItem key={assetId} $color={color}>
            {assetName}
            <span>{formatBalancePercentage(percentage)}%</span>
          </StyledLegendItem>
        );
      })}
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
            {otherAssets.map(({ assetId, color, percentage }) => {
              const assetName = assetNames[assetId] || assetId;
              return (
                <StyledLegendItem key={assetId} $color={color}>
                  {assetName}
                  <span>{formatBalancePercentage(percentage)}%</span>
                </StyledLegendItem>
              );
            })}
          </StyledExpandedOtherAssets>
        )}
      </StyledLegendItem>
    </>
  );
};
