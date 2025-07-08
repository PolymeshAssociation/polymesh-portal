import { AssetDocument } from '@polymeshassociation/polymesh-sdk/types';
import { SkeletonLoader } from '~/components/UiKit';
import {
  CardContainer,
  Details,
  DocumentDropdown,
  PropertiesDropdown,
  PropertiesItem,
} from '../DetailsCard';
import {
  StyledInfoItemHeader,
  StyledInfoItem,
  StyledDocumentWrap,
} from '../DetailsCard/styles';
import { StyledAssetDetailsCard } from './styles';
import { IAssetDetails } from '~/context/AssetContext/constants';

interface IAssetDetailsCardProps {
  assetDetails?: IAssetDetails;
  assetDetailsLoading: boolean;
}

export const AssetDetailsCard: React.FC<IAssetDetailsCardProps> = ({
  assetDetails,
  assetDetailsLoading,
}) => {
  if (assetDetailsLoading) {
    return (
      <StyledAssetDetailsCard>
        <SkeletonLoader height={500} />
      </StyledAssetDetailsCard>
    );
  }

  if (!assetDetails?.details) {
    return (
      <StyledAssetDetailsCard>
        The selected asset does not exist
      </StyledAssetDetailsCard>
    );
  }

  return (
    <StyledAssetDetailsCard>
      <CardContainer
        label={assetDetails?.details.isNftCollection ? 'Collection' : 'Asset'}
        value={assetDetails.assetId}
      >
        <>
          <Details details={assetDetails?.details} />
          {assetDetails?.details.collectionKeys.length > 0 && (
            <PropertiesDropdown label="Collection Keys">
              {assetDetails.details.collectionKeys.map((collectionKey) => (
                <PropertiesItem
                  key={collectionKey.type + collectionKey.id.toNumber()}
                  propKey={collectionKey.name}
                  propValue={collectionKey.specs.description}
                  propDescription={`Key ID: ${collectionKey.type} ${collectionKey.id}`}
                />
              ))}
            </PropertiesDropdown>
          )}
          {assetDetails?.docs?.length ? (
            <PropertiesDropdown
              label={`Asset Documents (${assetDetails?.docs?.length})`}
              removeBlockBackground
            >
              <StyledDocumentWrap>
                {assetDetails?.docs?.map((doc: AssetDocument) => (
                  <DocumentDropdown key={doc.name} document={doc} />
                ))}
              </StyledDocumentWrap>
            </PropertiesDropdown>
          ) : (
            <StyledInfoItem>
              <StyledInfoItemHeader $expanded={false} $isEmpty>
                No Asset Documents Found
              </StyledInfoItemHeader>
            </StyledInfoItem>
          )}
        </>
      </CardContainer>
    </StyledAssetDetailsCard>
  );
};
