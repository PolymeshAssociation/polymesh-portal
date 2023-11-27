import { useState } from 'react';
import { PortfolioBalance } from '@polymeshassociation/polymesh-sdk/types';
import { useWindowWidth } from '~/hooks/utility';
import { DropdownSelect } from '~/components/UiKit';
import { Icon } from '~/components';
import { AssetSelect } from './components/AssetSelect';
import { NftSelect } from './components/NftSelect';
import { EAssetType, TSelectedAsset, INft } from './constants';
import {
  StyledAssetForm,
  CloseButton,
  StyledSelectControls,
  StyledDropdownWrapper,
  StyledSelectBtn,
} from './styles';

interface IAssetFormProps {
  index: string;
  assets: PortfolioBalance[];
  assetBalance: number;
  collections: string[];
  getNftsPerCollection: (ticker: string | null) => INft[];
  handleSelectAsset: (index: string, item?: Partial<TSelectedAsset>) => void;
  handleDeleteAsset: (index: string) => void;
  portfolioName: string;
  children?: React.ReactNode;
  disabled?: boolean;
  memo?: React.ReactNode;
  maxNfts?: number;
}

const AssetForm: React.FC<IAssetFormProps> = ({
  index,
  assets,
  assetBalance,
  collections,
  portfolioName,
  getNftsPerCollection,
  handleSelectAsset,
  handleDeleteAsset,
  children,
  disabled,
  memo,
  maxNfts,
}) => {
  const [assetType, setAssetType] = useState<EAssetType>(EAssetType.FUNGIBLE);

  const { isMobile } = useWindowWidth();

  const toggleAssetType = (val: EAssetType) => {
    setAssetType(val);
    handleSelectAsset(index);
  };

  return (
    <StyledAssetForm>
      {Number(index) > 0 && (
        <CloseButton onClick={() => handleDeleteAsset?.(index)}>
          <Icon name="CloseIcon" size="20px" />
        </CloseButton>
      )}
      {isMobile ? (
        <StyledDropdownWrapper $index={+index}>
          <DropdownSelect
            options={Object.values(EAssetType)}
            onChange={(tabItem) => toggleAssetType(tabItem as EAssetType)}
            selected={assetType}
            placeholder="Select Tab"
            borderRadius={24}
            error={undefined}
          />
        </StyledDropdownWrapper>
      ) : (
        <StyledSelectControls>
          {Object.values(EAssetType).map((val) => (
            <StyledSelectBtn key={val} onClick={() => toggleAssetType(val)}>
              <Icon
                name={val === assetType ? 'RadioSelectedIcon' : 'RadioIcon'}
              />
              {val}
            </StyledSelectBtn>
          ))}
        </StyledSelectControls>
      )}
      {children}
      {assetType === EAssetType.FUNGIBLE ? (
        <AssetSelect
          index={index}
          assets={assets}
          assetBalance={assetBalance}
          handleSelectAsset={handleSelectAsset}
          disabled={disabled}
          portfolioName={portfolioName}
        />
      ) : (
        <NftSelect
          index={index}
          collections={collections}
          getNftsPerCollection={getNftsPerCollection}
          handleSelectAsset={handleSelectAsset}
          disabled={disabled}
          portfolioName={portfolioName}
          maxNfts={maxNfts}
        />
      )}
      {memo}
    </StyledAssetForm>
  );
};

export default AssetForm;
