import { SecurityIdentifier } from '@polymeshassociation/polymesh-sdk/types';
import { PropertiesDropdown } from '../PropertiesDropdown';
import { PropertiesItem } from '../PropertiesItem';
import { getDateTime, isValidLink } from '../../helpers';
import { formatDid, splitCamelCase } from '~/helpers/formatters';
import { IAssetMeta, IDetails } from '~/hooks/polymesh/useAssetDetails';

interface IDetailsProps {
  details: IDetails;
}

export const Details: React.FC<IDetailsProps> = ({ details }) => {
  const {
    assetIdentifiers,
    assetType,
    createdAt,
    fundingRound,
    holderCount,
    isDivisible,
    isNftCollection,
    metaData,
    name,
    owner,
    ticker,
    totalSupply,
    collectionId,
  } = details;
  return (
    <PropertiesDropdown label="Details" expanded>
      <>
        <PropertiesItem propKey="Name" propValue={name} />
        {collectionId && (
          <PropertiesItem
            propKey="NFT Collection ID"
            propValue={collectionId}
            propCopy={collectionId.toString()}
          />
        )}
        <PropertiesItem propKey="Ticker" propValue={ticker} />
        <PropertiesItem
          propKey="Asset Type"
          propValue={splitCamelCase(assetType)}
        />
        <PropertiesItem propKey="Total supply" propValue={totalSupply} />

        {fundingRound && (
          <PropertiesItem propKey="Funding Round" propValue={fundingRound} />
        )}

        <PropertiesItem propKey="Number of Holders" propValue={holderCount} />

        {!isNftCollection && (
          <PropertiesItem
            propKey="Divisible"
            propValue={isDivisible ? 'Yes' : 'No'}
          />
        )}

        {assetIdentifiers.map((identifier: SecurityIdentifier) => (
          <PropertiesItem
            key={identifier.type + identifier.value}
            propKey={identifier.type.toUpperCase()}
            propValue={identifier.value}
          />
        ))}

        {createdAt && (
          <PropertiesItem
            propKey="Created At"
            propValue={getDateTime(createdAt)}
          />
        )}
        <PropertiesItem
          propKey={isNftCollection ? 'Collection Owner' : 'Owner'}
          propValue={formatDid(owner, 8, 8)}
          propCopy={owner}
          isPink
        />
        {metaData.map((meta: IAssetMeta) => (
          <PropertiesItem
            key={meta.name}
            propKey={meta.name}
            propValue={meta.value}
            propDescription={meta.description}
            propIsLocked={meta.isLocked}
            propLockedUntil={meta.lockedUntil}
            propUrl={isValidLink(meta?.value)}
            isPink={!!isValidLink(meta?.value)}
          />
        ))}
      </>
    </PropertiesDropdown>
  );
};
