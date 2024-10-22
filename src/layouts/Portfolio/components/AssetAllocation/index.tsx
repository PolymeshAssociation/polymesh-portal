import { useContext, useEffect, useState } from 'react';
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
import { hexToUuid, stringToColor } from '~/helpers/formatters';
import { IAssetOption, IReducedOption } from './constants';
import { LegendItems } from './components/LedgendItems';

let smallAmountAssets: IAssetOption[] = [];
let normalAmountAssets: IAssetOption[] = [];

export const AssetAllocation = () => {
  const [assetOptions, setAssetOptions] = useState<IAssetOption[]>([]);
  const [reducedOptions, setReducedOptions] = useState<IReducedOption[]>([]);
  const { allPortfolios, totalAssetsAmount, portfolioLoading } =
    useContext(PortfolioContext);
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');

  useEffect(() => {
    if (!assetOptions.length) {
      setReducedOptions([]);
      return;
    }

    smallAmountAssets = [];
    normalAmountAssets = [];

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
      const reducedOption = smallAmountAssets.reduce((acc, { percentage }) => {
        return {
          ...acc,
          assetId: 'Other',
          percentage: (acc.percentage || 0) + percentage,
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
            assetId: hexToUuid(asset.id),
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
          if (acc.find(({ assetId }) => assetId === asset.assetId)) {
            return acc.map((accAsset) => {
              if (accAsset.assetId === asset.assetId) {
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
        }, [] as IAssetOption[])
        .sort((a, b) => b.percentage - a.percentage);

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

      const selectedPortfolioAssetOptions = selectedPortfolio.assets.map(
        ({ asset, total }) => ({
          assetId: hexToUuid(asset.id),
          amount: total.toNumber(),
          asset,
          color: stringToColor(asset.id),
          percentage:
            total.toNumber() > 0 ? (total.toNumber() / totalAmount) * 100 : 0,
        }),
      );

      selectedPortfolioAssetOptions.sort((a, b) => b.percentage - a.percentage);

      setAssetOptions(selectedPortfolioAssetOptions);
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
