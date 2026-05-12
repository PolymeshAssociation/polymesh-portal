import { bytesToString } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '~/components';
import {
  CardContainer,
  PropertiesDropdown,
  PropertiesItem,
} from '~/components/DetailsCard';
import { SkeletonLoader } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { formatDid } from '~/helpers/formatters';
import { NftStatusLabel } from '../NftStatusLabel';
import { EInfoType } from './constants';
import { useNftAsset } from './hooks';
import { StyledImage, StyledImageWrap, StyledNftContainer } from './styles';

export const NftAsset = () => {
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);
  const [searchParams] = useSearchParams();
  const nftId = searchParams.get('nftId');

  const { nft, nftLoading } = useNftAsset();
  const [portfolioName, setPortfolioName] = useState<string>('');

  useEffect(() => {
    if (
      nftLoading ||
      !polkadotApi ||
      !nft?.ownerDid ||
      !nft?.ownerPortfolioId
    ) {
      setPortfolioName('');
      return;
    }

    if (nft.ownerPortfolioId === 'default') {
      setPortfolioName('Default');
      return;
    }

    const did = nft.ownerDid;
    const portfolioId = nft.ownerPortfolioId;

    try {
      (async () => {
        const name = await polkadotApi.query.portfolio.portfolios(
          did,
          portfolioId,
        );
        if (name.isNone) {
          setPortfolioName('');
        }
        setPortfolioName(`${portfolioId} / ${bytesToString(name.unwrap())}`);
      })();
    } catch (error) {
      setPortfolioName('');
    }
  }, [nftLoading, nft?.ownerPortfolioId, nft?.ownerDid, polkadotApi]);

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
      <CardContainer
        label="Nft ID"
        value={nftId?.toString() as string}
        copyValue
      >
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
              propKey="Image URL"
              propValue={nft.imgUrl}
              propUrl={nft.imgUrl}
              isPink
            />
          )}
          {nft?.tokenUri && (
            <PropertiesItem
              propKey="Token URI"
              propValue={nft.tokenUri}
              propUrl={nft.tokenUri}
              isPink
            />
          )}
          {nft?.ownerDid && (
            <PropertiesItem
              propKey="Owned by (DID)"
              propValue={formatDid(nft.ownerDid, 8, 8)}
              propCopy={nft.ownerDid}
            />
          )}
          {nft?.ownerAddress && (
            <PropertiesItem
              propKey="Owned by (Account)"
              propValue={formatDid(nft.ownerAddress, 7, 4)}
              propCopy={nft.ownerAddress}
            />
          )}
          {portfolioName && (
            <PropertiesItem
              propKey="Owner Portfolio ID / Name"
              propValue={portfolioName}
            />
          )}
        </PropertiesDropdown>
        {nft?.onChainDetails?.length ? (
          <PropertiesDropdown label="Properties" subLabel={EInfoType.ON_CHAIN}>
            {nft?.onChainDetails?.map((detail) => (
              <PropertiesItem
                key={detail.metaKey}
                propKey={detail.metaKey}
                propValue={detail.metaValue}
                propDescription={detail.metaDescription}
              />
            ))}
          </PropertiesDropdown>
        ) : null}

        {nft?.offChainDetails?.length ? (
          <PropertiesDropdown label="Properties" subLabel={EInfoType.OFF_CHAIN}>
            {nft?.offChainDetails?.map((detail) => (
              <PropertiesItem
                key={detail.metaKey}
                propKey={detail.metaKey}
                propValue={detail.metaValue}
              />
            ))}
          </PropertiesDropdown>
        ) : null}
      </CardContainer>
    </StyledNftContainer>
  );
};
