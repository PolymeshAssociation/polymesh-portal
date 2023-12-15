import { useState, useEffect, useRef } from 'react';
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
} from '../../styles';
import {
  StyledSelectGroup,
  StyledSelectAll,
  StyledNftOption,
  StyledOptionImg,
  StyledLabelWrap,
  StyledLabel,
  StyledCloseBtn,
} from './styles';

interface INftSelectProps {
  index: string;
  collections: string[];
  getNftsPerCollection: (ticker: string | null) => INft[];
  handleSelectAsset: (index: string, item?: Partial<TSelectedAsset>) => void;
  portfolioName: string;
  maxNfts?: number;
  disabled?: boolean;
}

export const NftSelect: React.FC<INftSelectProps> = ({
  index,
  collections,
  getNftsPerCollection,
  handleSelectAsset,
  portfolioName,
  maxNfts,
  disabled,
}) => {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null,
  );
  const [collectionSelectExpanded, setCollectionSelectExpanded] =
    useState(false);

  const [selectedNfts, setSelectedNfts] = useState<INft[]>([]);
  const [nftSelectExpanded, setNftSelectExpanded] = useState(false);
  const portfolioRef = useRef<string | undefined>(undefined);

  const collectionRef = useOutsideClick(() =>
    setCollectionSelectExpanded(false),
  );
  const nftRef = useOutsideClick(() => setNftSelectExpanded(false));

  const allNfts = getNftsPerCollection(selectedCollection);
  const availableNfts = selectedNfts?.length
    ? allNfts.filter((nft) => {
        const exist = selectedNfts.find(
          (selected) => nft.id.toNumber() === selected.id.toNumber(),
        );
        return !exist;
      })
    : allNfts;

  const toggleCollectionSelectDropdown = () => {
    if (disabled) return;
    setCollectionSelectExpanded((prev) => !prev);
  };

  const toggleNftSelectDropdown = () => {
    if (!selectedCollection || disabled) return;
    setNftSelectExpanded((prev) => !prev);
  };

  const handleSelectCollection = (collection: string) => {
    setSelectedCollection(collection);
    setSelectedNfts([]);
    handleSelectAsset(index, {
      asset: collection,
      nfts: [],
    });
    toggleCollectionSelectDropdown();
  };

  const handleSelectNft = (newNft: INft) => {
    const newNfts = [...selectedNfts, newNft];
    setSelectedNfts(newNfts);
    handleSelectAsset(index, {
      asset: selectedCollection ?? undefined,
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
      asset: selectedCollection ?? undefined,
      nfts: newNfts.map((nft) => nft.id),
    });
  };

  const handleSelectAllNfts = () => {
    const selected = [...selectedNfts, ...availableNfts];
    setSelectedNfts(selected);
    handleSelectAsset(index, {
      asset: selectedCollection ?? undefined,
      nfts: [...allNfts, ...selectedNfts].map((nft) => nft.id),
    });
    toggleNftSelectDropdown();
  };

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

  return (
    <StyledSelectGroup>
      <div>
        <Text bold marginBottom={3}>
          Ticker
        </Text>
        <SelectWrapper ref={collectionRef}>
          <StyledSelect
            onClick={toggleCollectionSelectDropdown}
            $expanded={collectionSelectExpanded}
            $disabled={disabled}
          >
            {selectedCollection || (
              <StyledPlaceholder>Select Collection</StyledPlaceholder>
            )}
            <Icon name="ExpandIcon" className="expand-icon" size="18px" />
          </StyledSelect>
          {collectionSelectExpanded && (
            <StyledExpandedSelect>
              {collections?.length && collections.length ? (
                collections.map((collection) => (
                  <StyledSelectOption
                    key={collection}
                    onClick={() => handleSelectCollection(collection)}
                  >
                    {collection}
                  </StyledSelectOption>
                ))
              ) : (
                <StyledPlaceholder>No collections available</StyledPlaceholder>
              )}
            </StyledExpandedSelect>
          )}
        </SelectWrapper>
      </div>

      <div>
        <Text bold marginBottom={3}>
          ID
        </Text>
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
                      <Icon name="CloseCircledIcon" />
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
            <StyledError>You can send up to {maxNfts} nfts per leg</StyledError>
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
                          <img src={nft.imgUrl} alt={nft.imgUrl} />
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
