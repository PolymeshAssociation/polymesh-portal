import { useState, useEffect, useRef, useMemo } from 'react';
import {
  AssetDetails,
  NftCollection,
} from '@polymeshassociation/polymesh-sdk/types';
import { clsx } from 'clsx';
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
  StyledInput,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAssets, setFilteredAssets] =
    useState<NftCollection[]>(collections);
  const portfolioRef = useRef<string | undefined>(undefined);
  const collectionRef = useOutsideClick(() => {
    setCollectionSelectExpanded(false);
    setSearchQuery('');
  });
  const nftRef = useOutsideClick(() => setNftSelectExpanded(false));
  const assetDetailsCache = useRef<Record<string, AssetDetails>>({});
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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
    setCollectionSelectExpanded((prev) => {
      if (prev) setSearchQuery('');
      return !prev;
    });
  };

  const toggleNftSelectDropdown = () => {
    if (!selectedCollection || disabled) return;
    setNftSelectExpanded((prev) => !prev);
  };

  const handleSearchChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    setSearchQuery(target.value);
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

  useEffect(() => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    setFilteredAssets(
      collections.filter((asset) => {
        if (selectedCollection?.id === asset.id) return false;
        const assetDetails = assetDetailsCache.current[asset.id];
        return (
          formatUuid(asset.id).toLowerCase().includes(lowerSearchQuery) ||
          assetDetails?.name.toLowerCase().includes(lowerSearchQuery) ||
          assetDetails?.ticker?.toLowerCase().includes(lowerSearchQuery)
        );
      }),
    );
  }, [searchQuery, collections, selectedCollection]);

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
    () => selectedCollection && nfts[selectedCollection.id]?.[0]?.imgUrl,
    [nfts, selectedCollection],
  );

  useEffect(() => {
    if (collectionSelectExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [collectionSelectExpanded]);

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
                    <IconWrapper
                      $background={stringToColor(selectedCollection.id)}
                      className={clsx('stacked-icon', 'icon-1')}
                    >
                      <Icon name="Coins" size="16px" />
                    </IconWrapper>
                    <IconWrapper
                      $background={stringToColor(selectedCollection.id)}
                      className={clsx('stacked-icon', 'icon-2')}
                    >
                      <Icon name="Coins" size="16px" />
                    </IconWrapper>
                    <IconWrapper
                      $background={stringToColor(selectedCollection.id)}
                      className={clsx('stacked-icon', 'icon-3')}
                    >
                      <Icon name="Coins" size="16px" />
                    </IconWrapper>
                    {selectedCollectionImage && (
                      <img
                        src={selectedCollectionImage}
                        alt={selectedCollectionImage}
                        className={clsx('stacked-icon', 'image')}
                      />
                    )}
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
            <Icon
              name="ExpandIcon"
              className={clsx('expand-icon')}
              size="18px"
            />
          </StyledSelect>
          {collectionSelectExpanded && (
            <StyledExpandedSelect>
              <StyledInput
                ref={searchInputRef}
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={handleSearchChange}
              />

              {filteredAssets?.length > 0 ? (
                filteredAssets.map((asset) => {
                  const assetDetails = assetDetailsCache.current[asset.id];
                  return (
                    <StyledSelectOption
                      key={asset.id}
                      onClick={() => handleSelectCollection(asset)}
                    >
                      <StyledOptionImg>
                        <IconWrapper
                          $background={stringToColor(asset.id)}
                          className={clsx('stacked-icon', 'icon-1')}
                        >
                          <Icon name="Coins" size="16px" />
                        </IconWrapper>
                        <IconWrapper
                          $background={stringToColor(asset.id)}
                          className={clsx('stacked-icon', 'icon-2')}
                        >
                          <Icon name="Coins" size="16px" />
                        </IconWrapper>
                        <IconWrapper
                          $background={stringToColor(asset.id)}
                          className={clsx('stacked-icon', 'icon-3')}
                        >
                          <Icon name="Coins" size="16px" />
                        </IconWrapper>
                        {nfts[asset.id][0]?.imgUrl && (
                          <img
                            src={nfts[asset.id][0].imgUrl}
                            alt={nfts[asset.id][0].imgUrl}
                            className={clsx('stacked-icon', 'image')}
                          />
                        )}
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
                <StyledPlaceholder>No collections found</StyledPlaceholder>
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
                    <StyledOptionImg className={clsx('small')}>
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
            <Icon
              name="ExpandIcon"
              className={clsx('expand-icon')}
              size="18px"
            />
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
                        onClick={() => !nft.locked && handleSelectNft(nft)}
                        className={clsx({ locked: nft.locked })}
                      >
                        <StyledOptionImg>
                          <img
                            src={nft.imgUrl}
                            alt={nft.imgUrl}
                            className={clsx('image')}
                          />
                        </StyledOptionImg>
                        {nft.id.toNumber()}
                        {nft.locked && <Icon name="LockIcon" size="20px" />}
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
