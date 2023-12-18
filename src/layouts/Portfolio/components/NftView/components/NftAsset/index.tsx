import { useSearchParams } from 'react-router-dom';
import { SkeletonLoader } from '~/components/UiKit';
import { Icon } from '~/components';
import {
  PropertiesDropdown,
  PropertiesItem,
  CardContainer,
} from '../../../DetailsCard';
import { NftStatusLabel } from '../NftStatusLabel';
import { useNftAsset } from './hooks';
import { EInfoType } from './constants';
import { StyledNftContainer, StyledImageWrap, StyledImage } from './styles';

export const NftAsset = () => {
  const [searchParams] = useSearchParams();
  const nftId = searchParams.get('nftId');

  const { nft, nftLoading } = useNftAsset();

  if (nftLoading) {
    return (
      <StyledNftContainer>
        <SkeletonLoader width="100%" />
        <SkeletonLoader width="100%" />
      </StyledNftContainer>
    );
  }

  return (
    <StyledNftContainer>
      <StyledImageWrap>
        <StyledImage>
          {nft?.imgUrl ? (
            <img src={nft?.imgUrl || ''} alt={nftId as string} />
          ) : (
            <Icon name="Coins" size="100px" className="coins-icon" />
          )}
        </StyledImage>
        {nft?.isLocked && <NftStatusLabel />}
      </StyledImageWrap>

      <CardContainer label="Nft ID" value={nftId?.toString() as string}>
        <PropertiesDropdown label="Details" expanded>
          {nft?.name && <PropertiesItem propKey="Name" propValue={nft?.name} />}
          {nft?.description && (
            <PropertiesItem
              propKey="Description"
              propValue={nft?.description}
            />
          )}
          {nft?.imgUrl && (
            <PropertiesItem
              propKey="Image Url"
              propValue={nft?.imgUrl}
              propUrl={nft?.imgUrl}
              isPink
            />
          )}
        </PropertiesDropdown>
        {nft?.onChainDetails?.length ? (
          <PropertiesDropdown label="Properties" subLabel={EInfoType.ON_CHAIN}>
            <>
              {nft?.onChainDetails?.map((detail) => (
                <PropertiesItem
                  key={detail.metaKey}
                  propKey={detail.metaKey}
                  propValue={detail.metaValue}
                />
              ))}
            </>
          </PropertiesDropdown>
        ) : null}

        {nft?.offChainDetails?.length ? (
          <PropertiesDropdown label="Properties" subLabel={EInfoType.OFF_CHAIN}>
            <>
              {nft?.offChainDetails?.map((detail) => (
                <PropertiesItem
                  key={detail.metaKey}
                  propKey={detail.metaKey}
                  propValue={detail.metaValue}
                />
              ))}
            </>
          </PropertiesDropdown>
        ) : null}
      </CardContainer>
    </StyledNftContainer>
  );
};
