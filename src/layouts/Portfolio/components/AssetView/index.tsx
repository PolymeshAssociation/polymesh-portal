import { SkeletonLoader } from '~/components/UiKit';
import { Breadcrumbs } from '../Breadcrumbs';
import {
  CardContainer,
  Details,
  DocumentDropdown,
  PropertiesDropdown,
} from '../DetailsCard';
import {
  StyledInfoItemHeader,
  StyledInfoItem,
  StyledDocumentWrap,
} from '../DetailsCard/styles';
import { useAssetData } from './hooks';
import { StyledAssetContainer } from './styles';

export const AssetView = () => {
  const { assetData, assetLoading } = useAssetData();

  return (
    <StyledAssetContainer>
      <Breadcrumbs />
      {assetLoading || !assetData ? (
        <SkeletonLoader height={500} />
      ) : (
        <CardContainer label="Asset" value={assetData.id.toString()}>
          <>
            <Details details={assetData?.details} />
            {assetData?.docs?.length ? (
              <PropertiesDropdown label="Asset Documents">
                <StyledDocumentWrap>
                  {assetData?.docs?.map((doc: any) => (
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
      )}
    </StyledAssetContainer>
  );
};
