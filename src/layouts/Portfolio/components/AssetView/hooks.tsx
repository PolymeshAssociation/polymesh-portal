import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import { getCollectionCreationTime } from '~/helpers/graphqlQueries';
import { splitByCapitalLetters } from '~/helpers/formatters';
import { IAssetDetails } from '../DetailsCard/constants';

export const useAssetData = () => {
  const [assetData, setAssetData] = useState<IAssetDetails>(
    {} as IAssetDetails,
  );
  const [assetLoading, setAssetLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const asset = searchParams.get('asset');

  const {
    api: { sdk, gqlClient },
  } = useContext(PolymeshContext);

  useEffect(() => {
    if (!sdk || !gqlClient) return;

    setAssetLoading(true);

    (async () => {
      try {
        const data = await sdk.assets.getFungibleAsset({
          ticker: asset as string,
        });

        const details = await data.details();
        const docs = await data.documents.get();

        const createdAtData = await gqlClient.query({
          query: getCollectionCreationTime(asset as string),
        });
        const createdAt = createdAtData.data.assets.nodes[0].createdAt;
        const meta = await data.metadata.get();

        const metaData = await Promise.all(
          meta.map(async (entry) => {
            const details = await entry.details();
            const value = await entry.value();

            return {
              name: details.name ? splitByCapitalLetters(details.name) : '',
              description: details.specs.description,
              expiry: value?.expiry ? value?.expiry : null,
              isLocked: value?.lockStatus
                ? splitByCapitalLetters(value?.lockStatus)
                : null,
              value: value?.value || null,
            };
          }),
        );

        setAssetData({
          id: asset as string,
          details: {
            name: details.name,
            assetType: details.assetType,
            owner: details.owner.did,
            totalSupply: details.totalSupply.toNumber(),
            createdAt: createdAt,
            metaData,
          },
          docs: docs.data,
        });
      } catch (err) {
        notifyError((err as Error).message);
      } finally {
        setAssetLoading(false);
      }
    })();
  }, [sdk, gqlClient, asset]);

  return {
    assetData,
    assetLoading,
  };
};
