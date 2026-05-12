import { useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SkeletonLoader, Text } from '~/components/UiKit';
import { PortfolioContext } from '~/context/PortfolioContext';
import { stringToColor } from '~/helpers/formatters';
import { EBalanceHolder, getBalanceHolder } from '../../helpers';
import { LegendItems } from './components/LedgendItems';
import { IAssetOption, IReducedOption } from './constants';
import {
  StyledFraction,
  StyledLegendList,
  StyledPercentageBar,
  StyledPlaceholder,
  StyledWrapper,
} from './styles';

export const AssetAllocation = () => {
  const {
    allPortfolios,
    totalAssetsAmount,
    portfolioLoading,
    allAccountsData,
  } = useContext(PortfolioContext);
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const holder = searchParams.get('holder');
  const address = searchParams.get('address');
  const selectedHolder = getBalanceHolder(holder, portfolioId);

  // Compute asset options based on selected portfolio or all portfolios
  const assetOptions = useMemo((): IAssetOption[] => {
    const hasAnyData =
      allPortfolios.length > 0 ||
      Object.values(allAccountsData).some(({ assets }) => assets.length > 0);
    if (!hasAnyData) {
      return [];
    }

    if (selectedHolder === EBalanceHolder.ACCOUNT) {
      const accountData = allAccountsData[address ?? '']?.assets ?? [];
      const accountTotalAmount = accountData.reduce(
        (acc, { total }) => acc + total.toNumber(),
        0,
      );

      return accountData
        .map(({ asset, total }) => ({
          assetId: asset.id,
          amount: total.toNumber(),
          asset,
          color: stringToColor(asset.id),
          percentage:
            total.toNumber() > 0 && accountTotalAmount > 0
              ? (total.toNumber() / accountTotalAmount) * 100
              : 0,
        }))
        .sort((a, b) => b.percentage - a.percentage);
    }

    if (selectedHolder === EBalanceHolder.ALL) {
      // Aggregate all accounts under the DID + all portfolios
      const allAccountAssets = Object.values(allAccountsData).flatMap(
        ({ assets }) =>
          assets.map(({ asset, total }) => ({
            assetId: asset.id,
            amount: total.toNumber(),
            asset,
            color: stringToColor(asset.id),
            percentage:
              total.toNumber() > 0 && totalAssetsAmount > 0
                ? (total.toNumber() / totalAssetsAmount) * 100
                : 0,
          })),
      );

      return [
        ...allPortfolios.flatMap(({ assets }) =>
          assets.map(({ asset, total }) => ({
            assetId: asset.id,
            amount: total.toNumber(),
            asset,
            color: stringToColor(asset.id),
            percentage:
              total.toNumber() > 0 && totalAssetsAmount > 0
                ? (total.toNumber() / totalAssetsAmount) * 100
                : 0,
          })),
        ),
        ...allAccountAssets,
      ]
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
  }, [
    selectedHolder,
    portfolioId,
    address,
    allPortfolios,
    allAccountsData,
    totalAssetsAmount,
  ]);

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
        {portfolioLoading ? <SkeletonLoader /> : 'Balance allocation'}
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
