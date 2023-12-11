import { useState, useMemo, useEffect, useContext } from 'react';
import {
  FungibleAsset,
  Identity,
} from '@polymeshassociation/polymesh-sdk/types';
import { DropdownSelect, SkeletonLoader } from '~/components/UiKit';
import { TSelectedAsset } from '~/components/AssetForm/constants';
import {
  InputWrapper,
  StyledLabel,
  StyledInput,
  StyledPlaceholder,
  StyledError,
  FlexWrapper,
} from './styles';
import { TSelectedLeg } from './types';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { PolymeshContext } from '~/context/PolymeshContext';
import { getPortfolioDataFromIdentity, checkAvailableBalance } from './helpers';
import { notifyError } from '~/helpers/notifications';
import { useAssetForm } from '../AssetForm/hooks';
import { INonFungibleAsset } from '../AssetForm/constants';
import AssetForm from '../AssetForm';
import { MAX_NFTS_PER_LEG } from '../AssetForm/constants';

interface ILegSelectProps {
  index: number;
  handleAdd: (index: number, item: TSelectedLeg) => void;
  handleDelete: (index: number) => void;
  selectedLegs: TSelectedLeg[];
}

const LegSelect: React.FC<ILegSelectProps> = ({
  index,
  handleAdd,
  handleDelete,
  selectedLegs,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const [senderIdentity, setSenderIdentity] = useState<Identity | null>(null);
  const [receiverIdentity, setReceiverIdentity] = useState<Identity | null>(
    null,
  );
  const [senderPortfolios, setSenderPortfolios] = useState<IPortfolioData[]>(
    [],
  );
  const [receiverPortfolios, setReceiverPortfolios] = useState<
    IPortfolioData[]
  >([]);
  const [identityError, setIdentityError] = useState({
    sender: '',
    receiver: '',
  });
  const [selectedSenderPortfolio, setSelectedSenderPortfolio] =
    useState<IPortfolioData | null>(null);
  const [selectedReceiverPortfolio, setSelectedReceiverPortfolio] =
    useState<IPortfolioData | null>(null);
  const [shouldHideSenderPortfolio, setShouldHideSenderPortfolio] =
    useState(true);
  const [shouldHideReceiverPortfolio, setShouldHideReceiverPortfolio] =
    useState(true);
  const [portfolioLoading, setPortfolioLoading] = useState({
    sender: false,
    receiver: false,
  });

  const {
    assets = [],
    collections = [],
    selectedAssets,
    portfolioName,
    getAssetBalance,
    getNftsPerCollection,
    handleDeleteAsset,
    handleSelectAsset,
  } = useAssetForm(selectedSenderPortfolio, index);

  useEffect(() => {
    if (!selectedSenderPortfolio) return;
  }, [selectedSenderPortfolio]);

  const handleIdentitySelect = async (
    did: string,
    role: 'sender' | 'receiver',
  ) => {
    if (!sdk) return;

    switch (role) {
      case 'sender':
        if (!!senderIdentity && senderIdentity.did === did) {
          return;
        }
        handleSelectAsset(index.toString());
        setSelectedSenderPortfolio(null);
        setShouldHideSenderPortfolio(true);
        break;

      case 'receiver':
        if (!!receiverIdentity && receiverIdentity.did === did) {
          return;
        }
        setSelectedReceiverPortfolio(null);
        setShouldHideReceiverPortfolio(true);
        break;

      default:
        break;
    }

    if (!did.length) {
      setIdentityError((prev) => ({ ...prev, [role]: 'DID is required' }));
      return;
    }

    // test that the DID is hexadecimal and the correct length
    if (!/^0x[0-9a-fA-F]{64}$/.test(did)) {
      setIdentityError((prev) => ({
        ...prev,
        [role]: 'DID must be a valid',
      }));
      return;
    }
    const isValid = await sdk.identities.isIdentityValid({ identity: did });

    if (isValid) {
      try {
        setIdentityError((prev) => ({ ...prev, [role]: '' }));
        setPortfolioLoading((prev) => ({ ...prev, [role]: true }));
        const identity = await sdk.identities.getIdentity({ did });
        const portfolios = await getPortfolioDataFromIdentity(identity);
        switch (role) {
          case 'sender':
            setSelectedSenderPortfolio(null);
            setShouldHideSenderPortfolio(false);
            setSenderIdentity(identity);
            setSenderPortfolios(portfolios);
            break;

          case 'receiver':
            setSelectedReceiverPortfolio(null);
            setShouldHideReceiverPortfolio(false);
            setReceiverIdentity(identity);
            setReceiverPortfolios(portfolios);
            break;

          default:
            break;
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setPortfolioLoading((prev) => ({ ...prev, [role]: false }));
      }
    } else {
      setIdentityError((prev) => ({
        ...prev,
        [role]: 'Identity does not exist',
      }));
    }
  };

  const handlePortfolioSelect = (
    combinedId: string,
    role: 'sender' | 'receiver',
  ) => {
    if (!combinedId) return;

    const id = combinedId.split('/')[0].trim();

    switch (role) {
      case 'sender': {
        const selectedSendingPortfolio = senderPortfolios.find((item) => {
          return Number.isNaN(Number(id))
            ? item.id === 'default'
            : item.id === id;
        });
        if (selectedSendingPortfolio) {
          setSelectedSenderPortfolio(selectedSendingPortfolio);
        }
        break;
      }
      case 'receiver': {
        const selectedReceivingPortfolio = receiverPortfolios.find((item) => {
          return Number.isNaN(Number(id))
            ? item.id === 'default'
            : item.id === id;
        });
        if (selectedReceivingPortfolio) {
          setSelectedReceiverPortfolio(selectedReceivingPortfolio);
        }
        break;
      }

      default:
        break;
    }
  };

  const handleAddAsset = (index: string, item?: Partial<TSelectedAsset>) => {
    if (!selectedSenderPortfolio || !selectedReceiverPortfolio) return;
    handleSelectAsset(index, item);
    handleAdd(Number(index), {
      ...(item as TSelectedAsset),
      from: selectedSenderPortfolio.portfolio,
      to: selectedReceiverPortfolio.portfolio,
      index: Number(index),
    });
  };

  const handleDeleteLeg = (index: string) => {
    handleDelete(Number(index));
    handleDeleteAsset(index);
  };

  const getAvailableNfts = useMemo(
    () => (ticker: string) => {
      if (!selectedSenderPortfolio?.id || !ticker) return [];
      const currentAsset = selectedAssets[index].asset;
      const currentSelectedAssets = selectedLegs.filter(
        (leg) => leg.asset === currentAsset,
      );
      const allNfts = getNftsPerCollection(ticker);
      const nfts = allNfts.filter((nft) => {
        const nftExists = currentSelectedAssets.find((asset) =>
          (asset as INonFungibleAsset).nfts.some((item) => {
            return nft.id.toNumber() === item?.toNumber();
          }),
        );
        return !nftExists;
      });
      return nfts;
    },
    [selectedAssets, selectedLegs, selectedSenderPortfolio],
  );

  const balance = useMemo(() => {
    if (!selectedSenderPortfolio?.id) return 0;
    const currentAsset = selectedSenderPortfolio.assets.find(
      (asset) => asset.asset.ticker === selectedAssets[index].asset,
    );
    if (!currentAsset) return 0;
    const currentAssetBalance = getAssetBalance(
      currentAsset?.asset.ticker as string,
    );

    const currentBalance = checkAvailableBalance({
      asset: currentAsset?.asset as FungibleAsset,
      balance: currentAssetBalance || 0,
      selectedLegs,
      sender: selectedSenderPortfolio.portfolio.toHuman().did,
      portfolioId: selectedSenderPortfolio.id,
      assetIndex: index,
    });

    return currentBalance;
  }, [selectedAssets, selectedLegs, selectedSenderPortfolio, portfolioName]);

  return (
    <AssetForm
      index={index.toString()}
      assets={assets}
      collections={collections}
      getNftsPerCollection={getAvailableNfts}
      handleDeleteAsset={handleDeleteLeg}
      handleSelectAsset={handleAddAsset}
      assetBalance={balance}
      disabled={!selectedSenderPortfolio?.id || !selectedReceiverPortfolio?.id}
      portfolioName={portfolioName}
      maxNfts={MAX_NFTS_PER_LEG}
    >
      <FlexWrapper $marginBottom={16}>
        <InputWrapper>
          <StyledLabel>Sender</StyledLabel>
          <StyledInput
            placeholder="Sender DID"
            onBlur={({ target }) =>
              handleIdentitySelect(target.value, 'sender')
            }
          />
          {!!identityError.sender && (
            <StyledError>{identityError.sender}</StyledError>
          )}
        </InputWrapper>
        {!shouldHideSenderPortfolio ? (
          <DropdownSelect
            label="Sending Portfolio"
            placeholder="Select portfolio"
            options={senderPortfolios.map(({ id, name }) =>
              id === 'default' ? name : `${id} / ${name}`,
            )}
            onChange={(option) => handlePortfolioSelect(option, 'sender')}
            removeSelection={!selectedSenderPortfolio}
            error={undefined}
          />
        ) : (
          <InputWrapper>
            <StyledPlaceholder $isAbsolute>
              {portfolioLoading.sender ? (
                <SkeletonLoader height={16} />
              ) : (
                'Enter Sender DID'
              )}
            </StyledPlaceholder>
          </InputWrapper>
        )}
      </FlexWrapper>
      <FlexWrapper $marginBottom={16}>
        <InputWrapper>
          <StyledLabel>Receiver</StyledLabel>
          <StyledInput
            placeholder="Receiver DID"
            onBlur={({ target }) =>
              handleIdentitySelect(target.value, 'receiver')
            }
          />
          {!!identityError.receiver && (
            <StyledError>{identityError.receiver}</StyledError>
          )}
        </InputWrapper>
        {!shouldHideReceiverPortfolio ? (
          <DropdownSelect
            label="Receiving Portfolio"
            placeholder="Select portfolio"
            options={receiverPortfolios.map(({ id, name }) =>
              id === 'default' ? name : `${id} / ${name}`,
            )}
            onChange={(option) => handlePortfolioSelect(option, 'receiver')}
            removeSelection={!selectedReceiverPortfolio}
            error={undefined}
          />
        ) : (
          <InputWrapper>
            <StyledPlaceholder $isAbsolute>
              {portfolioLoading.receiver ? (
                <SkeletonLoader height={16} />
              ) : (
                'Enter Receiver DID'
              )}
            </StyledPlaceholder>
          </InputWrapper>
        )}
      </FlexWrapper>
    </AssetForm>
  );
};

export default LegSelect;
