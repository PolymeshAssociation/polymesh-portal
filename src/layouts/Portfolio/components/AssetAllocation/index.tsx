import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Asset } from '@polymeshassociation/polymesh-sdk/types';
import { Text } from '~/components/UiKit';
import { PortfolioContext } from '~/context/PortfolioContext';
import {
  StyledWrapper,
  StyledPercentageBar,
  StyledFraction,
  StyledLegendList,
  StyledLegendItem,
  StyledPlaceholder,
} from './styles';
import { formatBalance, stringToColor } from '~/helpers/formatters';

interface IAssetOption {
  ticker: string;
  amount: number;
  color: string;
  asset: Asset;
  percentage: number;
}

export const AssetAllocation = () => {
  const [assetOptions, setAssetOptions] = useState<IAssetOption[]>([]);
  const { allPortfolios, totalAssetsAmount, portfolioLoading } =
    useContext(PortfolioContext);
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');

  useEffect(() => {
    if (!allPortfolios) return;

    setAssetOptions([]);

    if (!portfolioId) {
      const reducedPortfolios = allPortfolios
        .flatMap(({ assets }) =>
          assets.map(({ asset, total }) => ({
            ticker: asset.toHuman(),
            amount: total.toNumber(),
            asset,
            color: stringToColor(asset.toHuman()),
            percentage: (total.toNumber() / totalAssetsAmount) * 100,
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
            percentage: (total.toNumber() / totalAmount) * 100,
          },
        ]),
      );
    }
  }, [portfolioId, allPortfolios, totalAssetsAmount]);

  return (
    <StyledWrapper>
      <Text size="large" bold>
        Asset allocation
      </Text>
      {!assetOptions.length || portfolioLoading ? (
        <StyledPlaceholder>
          {!portfolioLoading && !assetOptions.length && 'No assets available'}
        </StyledPlaceholder>
      ) : (
        <StyledPercentageBar>
          {assetOptions.map(({ ticker, color, percentage }) => {
            return (
              <StyledFraction
                key={ticker}
                percentage={percentage}
                color={color}
              />
            );
          })}
        </StyledPercentageBar>
      )}
      <StyledLegendList>
        {assetOptions.map(({ ticker, color, percentage }) => {
          return (
            <StyledLegendItem key={ticker} color={color}>
              {ticker}
              <span>{formatBalance(percentage)}%</span>
            </StyledLegendItem>
          );
        })}
      </StyledLegendList>
    </StyledWrapper>
  );
};
