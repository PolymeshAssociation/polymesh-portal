import { useState, useEffect, useRef, useMemo } from 'react';
import {
  AssetDetails,
  NftCollection,
} from '@polymeshassociation/polymesh-sdk/types';
import { Text } from '~/components/UiKit';
import { Icon } from '~/components';
import { useOutsideClick } from '../../hooks';
import { TSelectedAsset, INft } from '../../constants';
import {
  SelectWrapper,
  StyledSelect,
  StyledExpandedSelect,
  StyledSelectOption,
  StyledPlaceholder,
  StyledError,
  SelectedOption,
} from '../../styles';
import {
  StyledSelectGroup,
  StyledSelectAll,
  StyledNftOption,
  StyledOptionImg,
  StyledLabelWrap,
  StyledLabel,
  StyledCloseBtn,
  StyledActionButton,
  StyledNftSelectedHeadWrapper,
} from './styles';
import { formatUuid, stringToColor } from '~/helpers/formatters';
import { IconWrapper } from '../AssetSelect/styles';

interface INftSelectProps {
  index: string;
  collections: NftCollection[];
  nfts: Record<string, INft[]>;
  getNftsPerCollection: (collectionId?: string) => INft[];
  handleSelectAsset: (index: string, item?: Partial<TSelectedAsset>) => void;
  portfolioName: string;
  maxNfts?: number;
  disabled?: boolean;
}

export const NftSelect: React.FC<INftSelectProps> = ({
  index,
  collections,
  nfts,
  getNftsPerCollection,
  handleSelectAsset,
  portfolioName,
  maxNfts,
  disabled,
}) => {
  const [selectedCollection, setSelectedCollection] =
    useState<NftCollection | null>(null);
  const [collectionSelectExpanded, setCollectionSelectExpanded] =
    useState(false);

  const [selectedNfts, setSelectedNfts] = useState<INft[]>([]);
  const [nftSelectExpanded, setNftSelectExpanded] = useState(false);
  const [assetDetailsLoading, setAssetDetailsLoading] = useState(false);
  const portfolioRef = useRef<string | undefined>(undefined);

  const collectionRef = useOutsideClick(() =>
    setCollectionSelectExpanded(false),
  );
  const nftRef = useOutsideClick(() => setNftSelectExpanded(false));
  const assetDetailsCache = useRef<Record<string, AssetDetails>>({});

  useEffect(() => {
    const fetchAssetDetails = async () => {
      setAssetDetailsLoading(true);
      const assetDetailsPromises = collections.map(async (asset) => {
        if (!assetDetailsCache.current[asset.id]) {
          const details = await asset.details();
          assetDetailsCache.current[asset.id] = details;
        }
      });

      await Promise.all(assetDetailsPromises);
      setAssetDetailsLoading(false);
    };

    fetchAssetDetails();
  }, [collections]);

  const allNfts = useMemo(
    () => getNftsPerCollection(selectedCollection?.id),
    [getNftsPerCollection, selectedCollection?.id],
  );

  const availableNfts = useMemo(
    () =>
      selectedNfts?.length
        ? allNfts.filter((nft) => {
            const exist = selectedNfts.find(
              (selected) => nft.id.toNumber() === selected.id.toNumber(),
            );
            return !exist;
          })
        : allNfts,
    [allNfts, selectedNfts],
  );

  const toggleCollectionSelectDropdown = () => {
    if (disabled) return;
    setCollectionSelectExpanded((prev) => !prev);
  };

  const toggleNftSelectDropdown = () => {
    if (!selectedCollection || disabled) return;
    setNftSelectExpanded((prev) => !prev);
  };

  const handleSelectCollection = (collection: NftCollection) => {
    setSelectedCollection(collection);
    setSelectedNfts([]);
    handleSelectAsset(index, {
      asset: collection.id,
      nfts: [],
    });
    toggleCollectionSelectDropdown();
  };

  const handleSelectNft = (newNft: INft) => {
    const newNfts = [...selectedNfts, newNft];
    setSelectedNfts(newNfts);
    handleSelectAsset(index, {
      asset: selectedCollection?.id ?? undefined,
      nfts: newNfts.map((nft) => nft.id),
    });
  };

  const handleRemoveNft = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    nftId: number,
  ) => {
    e.stopPropagation();
    const newNfts = selectedNfts.filter((nft) => nft.id.toNumber() !== nftId);
    setSelectedNfts(newNfts);
    handleSelectAsset(index, {
      asset: selectedCollection?.id ?? undefined,
      nfts: newNfts.map((nft) => nft.id),
    });
  };

  const handleSelectAllNfts = () => {
    const selected = [...selectedNfts, ...availableNfts];
    setSelectedNfts(selected);
    handleSelectAsset(index, {
      asset: selectedCollection?.id ?? undefined,
      nfts: [...allNfts, ...selectedNfts].map((nft) => nft.id),
    });
    toggleNftSelectDropdown();
  };

  const handleClearAllNfts = () => {
    setSelectedNfts([]);
    handleSelectAsset(index, {
      asset: selectedCollection?.id ?? undefined,
      nfts: [],
    });
  };

  const selectedAssetDetails = useMemo(() => {
    if (!selectedCollection || assetDetailsLoading) return undefined;
    return assetDetailsCache.current[selectedCollection.id];
  }, [selectedCollection, assetDetailsLoading]);

  useEffect(() => {
    if (portfolioRef.current !== portfolioName) {
      if (selectedNfts?.length) {
        // reset selection if portfolio changed (advanced transfer)
        handleSelectAsset(index);
      }
      setSelectedCollection(null);
      setSelectedNfts([]);
    }
    portfolioRef.current = portfolioName;
  }, [handleSelectAsset, index, portfolioName, selectedNfts?.length]);

  const selectedCollectionImage = useMemo(
    () =>
      selectedCollection ? nfts[selectedCollection?.id][0].imgUrl : undefined,
    [nfts, selectedCollection],
  );

  return (
    <StyledSelectGroup>
      <div>
        <Text bold marginBottom={3}>
          Collection
        </Text>
        <SelectWrapper ref={collectionRef}>
          <StyledSelect
            onClick={toggleCollectionSelectDropdown}
            $expanded={collectionSelectExpanded}
            $disabled={disabled}
          >
            {selectedCollection ? (
              <SelectedOption>
                <StyledOptionImg>
                  <>
                    {selectedCollectionImage && (
                      <img
                        src={selectedCollectionImage}
                        alt={selectedCollectionImage}
                        className="stacked-icon image"
                      />
                    )}
                    <IconWrapper
                      $background={stringToColor(selectedCollection.id)}
                      className="stacked-icon icon-1"
                    >
                      <Icon name="Coins" size="16px" />
                    </IconWrapper>
                    <IconWrapper
                      $background={stringToColor(selectedCollection.id)}
                      className="stacked-icon icon-2"
                    >
                      <Icon name="Coins" size="16px" />
                    </IconWrapper>
                    <IconWrapper
                      $background={stringToColor(selectedCollection.id)}
                      className="stacked-icon icon-3"
                    >
                      <Icon name="Coins" size="16px" />
                    </IconWrapper>
                  </>
                </StyledOptionImg>
                {selectedAssetDetails
                  ? `${formatUuid(selectedCollection.id)} - ${selectedAssetDetails.name} ${
                      selectedAssetDetails.ticker &&
                      `(${selectedAssetDetails.ticker})`
                    }`
                  : formatUuid(selectedCollection.id)}
              </SelectedOption>
            ) : (
              <StyledPlaceholder>Select Collection</StyledPlaceholder>
            )}
            <Icon name="ExpandIcon" className="expand-icon" size="18px" />
          </StyledSelect>
          {collectionSelectExpanded && (
            <StyledExpandedSelect>
              {collections?.length > 0 ? (
                collections.map((asset) => {
                  const assetDetails = assetDetailsCache.current[asset.id];
                  return (
                    <StyledSelectOption
                      key={asset.id}
                      onClick={() => handleSelectCollection(asset)}
                    >
                      <StyledOptionImg>
                        {nfts[asset.id][0].imgUrl && (
                          <img
                            src={nfts[asset.id][0].imgUrl}
                            alt={nfts[asset.id][0].imgUrl}
                            className="stacked-icon image"
                          />
                        )}
                        <IconWrapper
                          $background={stringToColor(asset.id)}
                          className="stacked-icon icon-1"
                        >
                          <Icon name="Coins" size="16px" />
                        </IconWrapper>
                        <IconWrapper
                          $background={stringToColor(asset.id)}
                          className="stacked-icon icon-2"
                        >
                          <Icon name="Coins" size="16px" />
                        </IconWrapper>
                        <IconWrapper
                          $background={stringToColor(asset.id)}
                          className="stacked-icon icon-3"
                        >
                          <Icon name="Coins" size="16px" />
                        </IconWrapper>
                      </StyledOptionImg>
                      {assetDetails
                        ? `${formatUuid(asset.id)} - ${assetDetails.name} ${
                            assetDetails.ticker && `(${assetDetails.ticker})`
                          }`
                        : formatUuid(asset.id)}
                    </StyledSelectOption>
                  );
                })
              ) : (
                <StyledPlaceholder>No collections available</StyledPlaceholder>
              )}
            </StyledExpandedSelect>
          )}
        </SelectWrapper>
      </div>

      <div>
        <StyledNftSelectedHeadWrapper>
          <Text bold marginBottom={3}>
            ID
          </Text>
          <StyledActionButton
            disabled={selectedNfts.length <= 0}
            onClick={() => handleClearAllNfts()}
          >
            Clear All
            <Icon name="Delete" size="18px" />
          </StyledActionButton>
        </StyledNftSelectedHeadWrapper>
        <SelectWrapper ref={nftRef}>
          <StyledSelect
            onClick={toggleNftSelectDropdown}
            $expanded={nftSelectExpanded}
            $disabled={!selectedCollection}
          >
            {selectedNfts?.length ? (
              <StyledLabelWrap>
                {selectedNfts?.map((nft) => (
                  <StyledLabel key={nft?.id.toNumber()}>
                    <StyledOptionImg className="small">
                      <img src={nft.imgUrl} alt={nft.imgUrl} />
                    </StyledOptionImg>
                    {nft.id.toNumber()}
                    <StyledCloseBtn
                      onClick={(e) => handleRemoveNft(e, nft?.id.toNumber())}
                    >
                      <Icon name="CloseCircleIcon" />
                    </StyledCloseBtn>
                  </StyledLabel>
                ))}
              </StyledLabelWrap>
            ) : (
              <StyledPlaceholder>Select IDs</StyledPlaceholder>
            )}
            <Icon name="ExpandIcon" className="expand-icon" size="18px" />
          </StyledSelect>
          {maxNfts && selectedNfts.length > maxNfts && (
            <StyledError>You can send up to {maxNfts} NFTs per leg</StyledError>
          )}

          {nftSelectExpanded && (
            <StyledExpandedSelect>
              {availableNfts?.length ? (
                <>
                  <StyledSelectAll onClick={handleSelectAllNfts}>
                    Select All
                  </StyledSelectAll>
                  {availableNfts.map((nft) => {
                    if (
                      selectedNfts?.length &&
                      selectedNfts.some(
                        (selected) =>
                          selected.id.toNumber() === nft.id.toNumber(),
                      )
                    ) {
                      return null;
                    }
                    return (
                      <StyledNftOption
                        key={nft.id.toNumber()}
                        onClick={() => handleSelectNft(nft)}
                      >
                        <StyledOptionImg>
                          <img
                            src={nft.imgUrl}
                            alt={nft.imgUrl}
                            className="image"
                          />
                        </StyledOptionImg>
                        {nft.id.toNumber()}
                      </StyledNftOption>
                    );
                  })}
                </>
              ) : (
                <StyledPlaceholder>No NFTs available</StyledPlaceholder>
              )}
            </StyledExpandedSelect>
          )}
        </SelectWrapper>
      </div>
    </StyledSelectGroup>
  );
};
