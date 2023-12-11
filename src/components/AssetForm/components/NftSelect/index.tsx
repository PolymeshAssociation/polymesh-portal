import { useState, useEffect } from 'react';
import { notifyError } from '~/helpers/notifications';
import { Text } from '~/components/UiKit';
import { Icon } from '~/components';
import { useOutsideClick } from '../../hooks';
import { TSelectedAsset, ICollection, INft } from '../../constants';
import {
  SelectWrapper,
  StyledSelect,
  StyledExpandedSelect,
  StyledSelectOption,
  StyledPlaceholder,
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
  collections: ICollection[];
  getNftsPerCollection: (ticker: string) => INft[];
  handleSelectAsset: (index: string, item?: Partial<TSelectedAsset>) => void;
  portfolioName?: string;
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
  const [selectedCollection, setSelectedCollection] =
    useState<ICollection | null>(null);
  const [collectionSelectExpanded, setCollectionSelectExpanded] =
    useState(false);

  const [selectedNfts, setSelectedNfts] = useState<INft[]>([]);
  const [nftSelectExpanded, setNftSelectExpanded] = useState(false);

  const collectionRef = useOutsideClick(() =>
    setCollectionSelectExpanded(false),
  );
  const nftRef = useOutsideClick(() => setNftSelectExpanded(false));

  const allNfts = getNftsPerCollection(selectedCollection?.ticker as string);
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
    if (!selectedCollection?.ticker || disabled) return;
    setNftSelectExpanded((prev) => !prev);
  };

  const handleSelectCollection = (collection: ICollection) => {
    setSelectedCollection(collection);
    setSelectedNfts([]);
    handleSelectAsset(index, {
      asset: collection.ticker,
      nfts: [],
    });
    toggleCollectionSelectDropdown();
  };

  const handleSelectNft = (newNft: INft) => {
    if (selectedNfts.length === maxNfts) {
      notifyError(`You can send max ${maxNfts} nfts per leg`);
      return;
    }
    const newNfts = [...selectedNfts, newNft];
    setSelectedNfts(newNfts);
    handleSelectAsset(index, {
      asset: selectedCollection?.ticker,
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
      asset: selectedCollection?.ticker,
      nfts: newNfts.map((nft) => nft.id),
    });
  };

  const handleSelectAllNfts = () => {
    const selected = [...selectedNfts, ...availableNfts];
    setSelectedNfts(selected);
    handleSelectAsset(index, {
      asset: selectedCollection?.ticker,
      nfts: [...allNfts, ...selectedNfts].map((nft) => nft.id),
    });
    toggleNftSelectDropdown();
  };

  useEffect(() => {
    if (!portfolioName) {
      return;
    }
    if (selectedNfts?.length) {
      // reset selection if portfolio changed (advanced transfer)
      handleSelectAsset(index);
    }
    setSelectedCollection(null);
    setSelectedNfts([]);
  }, [portfolioName]);

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
            {selectedCollection ? (
              selectedCollection.name
            ) : (
              <StyledPlaceholder>Select Collection</StyledPlaceholder>
            )}
            <Icon name="ExpandIcon" className="expand-icon" size="18px" />
          </StyledSelect>
          {collectionSelectExpanded && (
            <StyledExpandedSelect>
              {collections?.length && collections.length ? (
                collections.map((collection) => (
                  <StyledSelectOption
                    key={collection.ticker}
                    onClick={() => handleSelectCollection(collection)}
                  >
                    {collection.name}
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
            $disabled={!selectedCollection?.ticker}
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
                <StyledPlaceholder>No nfts available</StyledPlaceholder>
              )}
            </StyledExpandedSelect>
          )}
        </SelectWrapper>
      </div>
    </StyledSelectGroup>
  );
};
