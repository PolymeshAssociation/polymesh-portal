import { SecurityIdentifier } from '@polymeshassociation/polymesh-sdk/types';
import { PropertiesDropdown } from '../PropertiesDropdown';
import { PropertiesItem } from '../PropertiesItem';
import { getDateTime, isValidLink } from '../../helpers';
import { formatDid, splitCamelCase } from '~/helpers/formatters';
import { MediatorList } from '../MediatorList';
import { IDetails, IAssetMeta } from '~/context/AssetContext/constants';

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
    requiredMediators,
    venueFilteringEnabled,
    permittedVenuesIds,
    isFrozen,
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
        <PropertiesItem
          propKey="Transfers Frozen"
          propValue={isFrozen ? 'Yes' : 'No'}
        />
        <PropertiesItem
          propKey="Transfer Venue Restrictions"
          propValue={venueFilteringEnabled ? 'Enabled' : 'Disabled'}
          propDescription="When enabled only the permitted venues can create instructions containing this asset"
        />
        {permittedVenuesIds.length > 0 && (
          <PropertiesItem
            propKey="Permitted Venue ID's"
            propValue={permittedVenuesIds
              .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
              .join(', ')}
            propDescription="ID's for venues allowed to create transfer instructions for the selected asset"
          />
        )}
        {requiredMediators.length > 0 && (
          <MediatorList mediatorList={requiredMediators} />
        )}
      </>
    </PropertiesDropdown>
  );
};
