import { useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SkeletonLoader, Text } from '~/components/UiKit';
import { PortfolioContext } from '~/context/PortfolioContext';
import {
  StyledWrapper,
  StyledPercentageBar,
  StyledFraction,
  StyledLegendList,
  StyledPlaceholder,
} from './styles';
import { stringToColor } from '~/helpers/formatters';
import { IAssetOption, IReducedOption } from './constants';
import { LegendItems } from './components/LedgendItems';

export const AssetAllocation = () => {
  const { allPortfolios, totalAssetsAmount, portfolioLoading } =
    useContext(PortfolioContext);
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');

  // Compute asset options based on selected portfolio or all portfolios
  const assetOptions = useMemo((): IAssetOption[] => {
    if (!allPortfolios.length) {
      return [];
    }

    if (!portfolioId) {
      // For all portfolios combined
      return allPortfolios
        .flatMap(({ assets }) =>
          assets.map(({ asset, total }) => ({
            assetId: asset.id,
            amount: total.toNumber(),
            asset,
            color: stringToColor(asset.id),
            percentage:
              total.toNumber() > 0
                ? (total.toNumber() / totalAssetsAmount) * 100
                : 0,
          })),
        )
        .reduce((acc, asset) => {
          const existingAsset = acc.find(
            ({ assetId }) => assetId === asset.assetId,
          );
          if (existingAsset) {
            existingAsset.amount += asset.amount;
            existingAsset.percentage += asset.percentage;
            return acc;
          }
          return [...acc, asset];
        }, [] as IAssetOption[])
        .sort((a, b) => b.percentage - a.percentage);
    }

    // For selected portfolio
    const selectedPortfolio = allPortfolios.find(
      ({ id }) => id === portfolioId,
    );
    if (!selectedPortfolio) {
      return [];
    }

    const totalAmount = selectedPortfolio.assets.reduce(
      (acc, { total }) => acc + total.toNumber(),
      0,
    );

    return selectedPortfolio.assets
      .map(({ asset, total }) => ({
        assetId: asset.id,
        amount: total.toNumber(),
        asset,
        color: stringToColor(asset.id),
        percentage:
          total.toNumber() > 0 ? (total.toNumber() / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [portfolioId, allPortfolios, totalAssetsAmount]);

  // Compute reduced options for the percentage bar
  const reducedOptions = useMemo((): IReducedOption[] => {
    if (!assetOptions.length) {
      return [];
    }

    const smallAmountAssets: IAssetOption[] = [];
    const normalAmountAssets: IAssetOption[] = [];

    assetOptions.forEach((option) => {
      if (option.percentage < 0.1) {
        smallAmountAssets.push(option);
      } else {
        normalAmountAssets.push(option);
      }
    });

    const normalOptions: IReducedOption[] = normalAmountAssets.map(
      ({ assetId, percentage, color }) => ({
        assetId,
        percentage,
        color,
      }),
    );

    if (smallAmountAssets.length) {
      const reducedOption = smallAmountAssets.reduce(
        (acc, { percentage }) => ({
          ...acc,
          assetId: 'Other',
          percentage: (acc.percentage || 0) + percentage,
          color: '#EC4673',
        }),
        {} as IReducedOption,
      );
      return [...normalOptions, reducedOption];
    }

    return normalOptions;
  }, [assetOptions]);

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
              {reducedOptions.map(({ assetId, color, percentage }) => {
                return (
                  <StyledFraction
                    key={assetId}
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
          <LegendItems assets={assetOptions} />
        )}
      </StyledLegendList>
    </StyledWrapper>
  );
};
