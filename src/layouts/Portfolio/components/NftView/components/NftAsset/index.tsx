import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SkeletonLoader } from '~/components/UiKit';
import { Icon, CopyToClipboard } from '~/components';
import { PropertiesDropdown } from './components/PropertiesDropdown';
import { NftStatusLabel } from '../NftStatusLabel';
import { useNftAsset } from './hooks';
import { EInfoType } from './constants';
import {
  StyledNftContainer,
  StyledImageWrap,
  StyledImage,
  StyledInfoContainer,
  StyledId,
  StyledInfoItem,
  StyledInfo,
  StyledInfoItemHeader,
  StyledInfoBlockWrap,
  StyledInfoBlock,
  StyledInfoBlockItem,
  StyledInfoBlockHead,
  StyledInfoBlockPink,
} from './styles';

export const NftAsset = () => {
  const [expandedDetails, setExpandedDetails] = useState(true);
  const [searchParams] = useSearchParams();
  const nftId = searchParams.get('nftId');

  const { nft, nftLoading } = useNftAsset();

  const toggleExpandedDetails = () => setExpandedDetails((prev) => !prev);

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
      <StyledInfoContainer>
        <StyledId>
          Nft ID: #{nftId}
          <CopyToClipboard value={nftId as string} />
        </StyledId>
        <StyledInfo>
          <StyledInfoItem>
            <StyledInfoItemHeader
              onClick={toggleExpandedDetails}
              $expanded={expandedDetails}
            >
              Details
              <Icon name="ExpandIcon" size="24px" className="expand-icon" />
            </StyledInfoItemHeader>
            {expandedDetails && (
              <StyledInfoBlockWrap>
                <StyledInfoBlock>
                  {nft?.name && (
                    <StyledInfoBlockItem>
                      <StyledInfoBlockHead>Name</StyledInfoBlockHead>
                      {nft.name}
                    </StyledInfoBlockItem>
                  )}
                  {nft?.description && (
                    <StyledInfoBlockItem>
                      <StyledInfoBlockHead>Description</StyledInfoBlockHead>
                      {nft.description}
                    </StyledInfoBlockItem>
                  )}
                  {nft?.imgUrl && (
                    <StyledInfoBlockItem>
                      <StyledInfoBlockHead>Image URL</StyledInfoBlockHead>
                      <StyledInfoBlockPink>
                        <a
                          href={nft.imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {nft.imgUrl}
                        </a>
                      </StyledInfoBlockPink>
                    </StyledInfoBlockItem>
                  )}
                </StyledInfoBlock>
              </StyledInfoBlockWrap>
            )}
          </StyledInfoItem>
          {nft?.onChainDetails && (
            <PropertiesDropdown
              type={EInfoType.ON_CHAIN}
              args={nft?.onChainDetails}
            />
          )}
          {nft?.offChainDetails && (
            <PropertiesDropdown
              type={EInfoType.OFF_CHAIN}
              args={nft?.offChainDetails}
            />
          )}
        </StyledInfo>
      </StyledInfoContainer>
    </StyledNftContainer>
  );
};
