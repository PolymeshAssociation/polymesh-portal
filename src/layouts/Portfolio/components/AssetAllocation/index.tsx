import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FungibleAsset } from '@polymeshassociation/polymesh-sdk/types';
import { SkeletonLoader, Text } from '~/components/UiKit';
import { PortfolioContext } from '~/context/PortfolioContext';
import {
  StyledWrapper,
  StyledPercentageBar,
  StyledFraction,
  StyledLegendList,
  StyledLegendItem,
  StyledPlaceholder,
  StyledExpandedOtherAssets,
} from './styles';
import { formatBalance, stringToColor } from '~/helpers/formatters';

interface IAssetOption {
  ticker: string;
  amount: number;
  color: string;
  asset: FungibleAsset;
  percentage: number;
}

interface IReducedOption {
  ticker: string;
  percentage: number;
  color: string;
}

let smallAmountAssets: IAssetOption[] = [];
let normalAmountAssets: IAssetOption[] = [];

export const AssetAllocation = () => {
  const [assetOptions, setAssetOptions] = useState<IAssetOption[]>([]);
  const [reducedOptions, setReducedOptions] = useState<IReducedOption[]>([]);
  const [otherAssetsExpanded, setOtherAssetsExpanded] = useState(false);
  const { allPortfolios, totalAssetsAmount, portfolioLoading } =
    useContext(PortfolioContext);
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');

  useEffect(() => {
    if (!assetOptions.length) return;

    smallAmountAssets = [];
    normalAmountAssets = [];

    assetOptions.forEach((option) => {
      if (option.percentage < 20) {
        smallAmountAssets.push(option);
      } else {
        normalAmountAssets.push(option);
      }
    });

    const normalOptions: IReducedOption[] = normalAmountAssets.map(
      ({ ticker, percentage, color }) => ({
        ticker,
        percentage,
        color,
      }),
    );

    if (smallAmountAssets.length) {
      const reducedOption = smallAmountAssets.reduce((acc, { percentage }) => {
        return {
          ...acc,
          ticker: 'Other',
          percentage: acc.percentage || 0 + percentage,
          color: '#EC4673',
        };
      }, {} as IReducedOption);
      setReducedOptions([...normalOptions, reducedOption]);
    } else {
      setReducedOptions(normalOptions);
    }
  }, [assetOptions]);

  useEffect(() => {
    if (!allPortfolios.length) {
      setAssetOptions([]);
      setReducedOptions([]);
      return;
    }

    setAssetOptions([]);

    if (!portfolioId) {
      const reducedPortfolios = allPortfolios
        .flatMap(({ assets }) =>
          assets.map(({ asset, total }) => ({
            ticker: asset.toHuman(),
            amount: total.toNumber(),
            asset,
            color: stringToColor(asset.toHuman()),
            percentage:
              total.toNumber() > 0
                ? (total.toNumber() / totalAssetsAmount) * 100
                : 0,
          })),
        )
        .reduce((acc, asset) => {
          if (acc.find(({ ticker }) => ticker === asset.ticker)) {
            return acc.map((accAsset) => {
              if (accAsset.ticker === asset.ticker) {
                return {
                  ...accAsset,
                  amount: accAsset.amount + asset.amount,
                  percentage: accAsset.percentage + asset.percentage,
                };
              }
              return accAsset;
            });
          }
          return [...acc, asset];
        }, [] as IAssetOption[]);
      setAssetOptions(reducedPortfolios);
      return;
    }

    const selectedPortfolio = allPortfolios.find(
      ({ id }) => id === portfolioId,
    );

    if (selectedPortfolio) {
      const totalAmount = selectedPortfolio.assets.reduce(
        (acc, { total }) => acc + total.toNumber(),
        0,
      );
      selectedPortfolio.assets.map(({ asset, total }) =>
        setAssetOptions((prev) => [
          ...prev,
          {
            ticker: asset.toHuman(),
            amount: total.toNumber(),
            asset,
            color: stringToColor(asset.toHuman()),
            percentage:
              total.toNumber() > 0 ? (total.toNumber() / totalAmount) * 100 : 0,
          },
        ]),
      );
    }
  }, [portfolioId, allPortfolios, totalAssetsAmount]);

  return (
    <StyledWrapper>
      <Text size="large" bold marginBottom={22}>
        {portfolioLoading ? <SkeletonLoader /> : 'Asset allocation'}
      </Text>
      {portfolioLoading ? (
        <SkeletonLoader height={56} borderRadius={8} />
      ) : (
        <>
          {!assetOptions.length && (
            <StyledPlaceholder>No assets available</StyledPlaceholder>
          )}
          {!!assetOptions.length && (
            <StyledPercentageBar>
              {reducedOptions.map(({ ticker, color, percentage }) => {
                return (
                  <StyledFraction
                    key={ticker}
                    $percentage={percentage}
                    $color={color}
                  />
                );
              })}
            </StyledPercentageBar>
          )}
        </>
      )}

      <StyledLegendList>
        {portfolioLoading ? (
          <SkeletonLoader />
        ) : (
          reducedOptions.map(({ ticker, color, percentage }) => {
            const isOther = ticker === 'Other';
            return isOther ? (
              <StyledLegendItem
                key={ticker}
                $color={color}
                $expandable
                onMouseEnter={() => setOtherAssetsExpanded(true)}
                onMouseLeave={() => setOtherAssetsExpanded(false)}
              >
                {ticker}
                <span>{formatBalance(percentage, 2)}%</span>
                {otherAssetsExpanded && (
                  <StyledExpandedOtherAssets>
                    {smallAmountAssets.map((option) => (
                      <StyledLegendItem
                        key={option.ticker}
                        $color={option.color}
                      >
                        {option.ticker}
                        <span>{formatBalance(option.percentage, 2)}%</span>
                      </StyledLegendItem>
                    ))}
                  </StyledExpandedOtherAssets>
                )}
              </StyledLegendItem>
            ) : (
              <StyledLegendItem key={ticker} $color={color}>
                {ticker}
                <span>{formatBalance(percentage, 2)}%</span>
              </StyledLegendItem>
            );
          })
        )}
      </StyledLegendList>
    </StyledWrapper>
  );
};
