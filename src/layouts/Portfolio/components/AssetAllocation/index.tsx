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
          })),
        )
        .reduce((acc, asset) => {
          if (acc.find(({ ticker }) => ticker === asset.ticker)) {
            return acc.map((accAsset) => {
              if (accAsset.ticker === asset.ticker) {
                return { ...accAsset, amount: accAsset.amount + asset.amount };
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
      selectedPortfolio.assets.map(({ asset, total }) =>
        setAssetOptions((prev) => [
          ...prev,
          {
            ticker: asset.toHuman(),
            amount: total.toNumber(),
            asset,
            color: stringToColor(asset.toHuman()),
          },
        ]),
      );
    }
  }, [portfolioId, allPortfolios]);

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
          {assetOptions.map(({ ticker, amount, color }) => {
            const percentage = (amount / totalAssetsAmount) * 100;
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
        {assetOptions.map(({ ticker, amount, color }) => {
          const percentage = (amount / totalAssetsAmount) * 100;

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
