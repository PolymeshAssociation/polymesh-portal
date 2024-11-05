import { useState, useMemo, useContext, useCallback } from 'react';
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
import { INonFungibleAsset, MAX_NFTS_PER_LEG } from '../AssetForm/constants';
import AssetForm from '../AssetForm';

interface ILegSelectProps {
  index: number;
  handleUpdateLeg: (index: number, item: TSelectedLeg) => void;
  handleDelete: (index: number) => void;
  selectedLegs: TSelectedLeg[];
  legIndexes: number[];
}

const LegSelect: React.FC<ILegSelectProps> = ({
  index,
  handleUpdateLeg,
  handleDelete,
  selectedLegs,
  legIndexes,
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
    nfts,
    getNftsPerCollection,
    handleDeleteAsset,
    handleSelectAsset,
  } = useAssetForm(selectedSenderPortfolio, index);

  const selectedLeg = useMemo(() => {
    return selectedLegs.find((leg) => leg.index === index);
  }, [selectedLegs, index]);

  // Helper function to validate the DID input and identity existence
  const validateDid = useCallback(
    async (did: string, role: 'sender' | 'receiver') => {
      if (!did.length) {
        const otherRole = role === 'sender' ? 'receiver' : 'sender';

        if (identityError[role] === `Cannot also be ${otherRole}`) {
          setIdentityError({
            sender: role === 'sender' ? 'DID is required' : '',
            receiver: role === 'receiver' ? 'DID is required' : '',
          });
          return false;
        }
        setIdentityError((prev) => ({ ...prev, [role]: 'DID is required' }));
        return false;
      }

      if (!/^0x[0-9a-fA-F]{64}$/.test(did)) {
        const otherRole = role === 'sender' ? 'receiver' : 'sender';

        if (identityError[role] === `Cannot also be ${otherRole}`) {
          setIdentityError({
            sender: role === 'sender' ? 'DID must be valid' : '',
            receiver: role === 'receiver' ? 'DID must be valid' : '',
          });
          return false;
        }
        setIdentityError((prev) => ({
          ...prev,
          [role]: 'DID must be valid',
        }));
        return false;
      }

      const isValid = await sdk?.identities.isIdentityValid({ identity: did });
      if (!isValid) {
        const otherRole = role === 'sender' ? 'receiver' : 'sender';

        if (identityError[role] === `Cannot also be ${otherRole}`) {
          setIdentityError({
            sender: role === 'sender' ? 'Identity does not exist' : '',
            receiver: role === 'receiver' ? 'Identity does not exist' : '',
          });
          return false;
        }

        setIdentityError((prev) => ({
          ...prev,
          [role]: 'Identity does not exist',
        }));
        return false;
      }

      return true;
    },
    [identityError, sdk?.identities],
  );

  // Helper function to check if the DID hasn't changed
  const isSameIdentity = useCallback(
    (did: string, role: 'sender' | 'receiver') => {
      return role === 'sender'
        ? senderIdentity?.did === did
        : receiverIdentity?.did === did;
    },
    [receiverIdentity?.did, senderIdentity?.did],
  );

  // Helper function to update the state based on role
  const setRoleSpecificState = (
    role: 'sender' | 'receiver',
    identity: Identity | null,
    hidePortfolio: boolean,
    portfolios: IPortfolioData[],
  ) => {
    if (role === 'sender') {
      setSelectedSenderPortfolio(null);
      setShouldHideSenderPortfolio(hidePortfolio);
      setSenderIdentity(identity);
      setSenderPortfolios(portfolios);
    } else {
      setSelectedReceiverPortfolio(null);
      setShouldHideReceiverPortfolio(hidePortfolio);
      setReceiverIdentity(identity);
      setReceiverPortfolios(portfolios);
    }
  };

  // Helper function to remove properties from selected leg based on role
  const removePropertiesFromLeg = (
    leg: TSelectedLeg,
    role: 'sender' | 'receiver',
  ) => {
    if (role === 'sender') {
      if ('amount' in leg) {
        const { from, asset, amount, ...restFungible } = leg;
        return restFungible;
      }
      const { from, asset, nfts: legNfts, ...restNonFungible } = leg;
      return restNonFungible;
    }
    // if not sender remove the previous receiver
    const { to, ...rest } = leg;
    return rest;
  };

  // Helper function to handle an invalid identity scenario
  const handleInvalidIdentity = useCallback(
    (role: 'sender' | 'receiver') => {
      if (selectedLeg) {
        const updatedLeg = removePropertiesFromLeg(selectedLeg, role);
        handleUpdateLeg(Number(index), updatedLeg as TSelectedLeg);
      }

      setRoleSpecificState(role, null, true, []);
    },
    [handleUpdateLeg, index, selectedLeg],
  );

  // Helper function to handle an invalid portfolio scenario
  const handleInvalidPortfolio = useCallback(
    (role: 'sender' | 'receiver') => {
      if (selectedLeg) {
        const updatedLeg = removePropertiesFromLeg(selectedLeg, role);
        handleUpdateLeg(Number(index), updatedLeg as TSelectedLeg);
      }
      const identity = role === 'sender' ? senderIdentity : receiverIdentity;
      const portfolios =
        role === 'sender' ? senderPortfolios : receiverPortfolios;

      setRoleSpecificState(role, identity, false, portfolios);
    },
    [
      handleUpdateLeg,
      index,
      receiverIdentity,
      receiverPortfolios,
      selectedLeg,
      senderIdentity,
      senderPortfolios,
    ],
  );

  // Helper function to fetch identity and portfolios
  const fetchIdentityAndPortfolios = useCallback(
    async (did: string, role: 'sender' | 'receiver') => {
      if (!sdk) return;

      try {
        setPortfolioLoading((prev) => ({ ...prev, [role]: true }));

        const identity = await sdk.identities.getIdentity({ did });
        const portfolios = await getPortfolioDataFromIdentity(identity);

        setRoleSpecificState(role, identity, false, portfolios);

        if (selectedLeg) {
          const updatedLeg = removePropertiesFromLeg(selectedLeg, role);
          handleUpdateLeg(Number(index), updatedLeg as TSelectedLeg);
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setPortfolioLoading((prev) => ({ ...prev, [role]: false }));
      }
    },
    [handleUpdateLeg, index, sdk, selectedLeg],
  );

  const isSenderEqualReceiver = useCallback(
    (did: string, role: 'sender' | 'receiver') => {
      const otherPartyIdentity =
        role === 'sender' ? receiverIdentity : senderIdentity;

      if (did === otherPartyIdentity?.did) {
        return true;
      }
      return false;
    },
    [receiverIdentity, senderIdentity],
  );

  // Main function for handling identity selection
  const handleIdentitySelect = useCallback(
    async (did: string, role: 'sender' | 'receiver') => {
      if (!sdk) return;

      const isValidDid = await validateDid(did, role);
      if (!isValidDid) {
        handleInvalidIdentity(role);
        return;
      }

      if (isSameIdentity(did, role)) return;

      if (isSenderEqualReceiver(did, role)) {
        setIdentityError({
          sender: 'Cannot also be receiver',
          receiver: 'Cannot also be sender',
        });
      } else {
        setIdentityError((prev) => {
          const otherRole = role === 'sender' ? 'receiver' : 'sender';

          if (prev[otherRole] === `Cannot also be ${role}`) {
            return { sender: '', receiver: '' };
          }

          return { ...prev, [role]: '' };
        });
      }

      await fetchIdentityAndPortfolios(did, role);
    },
    [
      fetchIdentityAndPortfolios,
      handleInvalidIdentity,
      isSameIdentity,
      isSenderEqualReceiver,
      sdk,
      validateDid,
    ],
  );

  const handlePortfolioSelect = useCallback(
    (combinedId: string | null, role: 'sender' | 'receiver') => {
      if (!combinedId) {
        if (role === 'sender') {
          setSelectedSenderPortfolio(null);
          handleInvalidPortfolio(role);
        }
        if (role === 'receiver') {
          setSelectedReceiverPortfolio(null);
          handleInvalidPortfolio(role);
        }
        return;
      }

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
            const updatedLeg = {
              ...selectedLeg,
              from: selectedSendingPortfolio.portfolio,
            } as TSelectedLeg;
            handleUpdateLeg(index, updatedLeg);
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
            const updatedLeg = {
              ...selectedLeg,
              to: selectedReceivingPortfolio.portfolio,
            } as TSelectedLeg;
            handleUpdateLeg(index, updatedLeg);
          }
          break;
        }

        default:
          break;
      }
    },
    [
      handleUpdateLeg,
      handleInvalidPortfolio,
      index,
      receiverPortfolios,
      selectedLeg,
      senderPortfolios,
    ],
  );

  const handleUpdateLegAsset = useCallback(
    (selectedIndex: string, item?: Partial<TSelectedAsset>) => {
      let selectedLegWithoutAsset: Partial<TSelectedLeg> = {};
      if (selectedLeg) {
        if ('amount' in selectedLeg) {
          const { asset, amount, ...rest } = selectedLeg;
          selectedLegWithoutAsset = rest;
        } else {
          const { asset, nfts: legNfts, ...rest } = selectedLeg;
          selectedLegWithoutAsset = rest;
        }
      }
      handleSelectAsset(selectedIndex, item);
      handleUpdateLeg(Number(selectedIndex), {
        ...selectedLegWithoutAsset,
        ...(item as TSelectedAsset),
      } as TSelectedLeg);
    },
    [handleUpdateLeg, handleSelectAsset, selectedLeg],
  );

  const handleDeleteLeg = useCallback(
    (deleteIndex: string) => {
      handleDelete(Number(deleteIndex));
      handleDeleteAsset(deleteIndex);
    },
    [handleDelete, handleDeleteAsset],
  );

  const getAvailableNfts = useCallback(
    (collectionId?: string) => {
      if (!selectedSenderPortfolio?.id || !collectionId) return [];
      const currentAsset = selectedAssets[index].asset;
      const currentSelectedAssets = selectedLegs.filter(
        (leg) => leg.asset === currentAsset,
      );
      const allNfts = getNftsPerCollection(collectionId);
      const availableNfts = allNfts.filter((nft) => {
        const nftExists = currentSelectedAssets.find((asset) =>
          (asset as INonFungibleAsset).nfts.some((item) => {
            return nft.id.toNumber() === item?.toNumber();
          }),
        );
        return !nftExists;
      });
      return availableNfts;
    },
    [
      getNftsPerCollection,
      index,
      selectedAssets,
      selectedLegs,
      selectedSenderPortfolio?.id,
    ],
  );

  const balance = useMemo(() => {
    if (!selectedSenderPortfolio?.id) return 0;
    const currentAsset = selectedSenderPortfolio.assets.find(
      (asset) => asset.asset.id === selectedAssets[index].asset,
    );

    if (!currentAsset) return 0;

    const currentBalance = checkAvailableBalance({
      asset: currentAsset?.asset as FungibleAsset,
      balance: currentAsset.free || 0,
      selectedLegs,
      sender: selectedSenderPortfolio.portfolio.owner.did,
      portfolioId: selectedSenderPortfolio.id,
      assetIndex: index,
    });

    return currentBalance;
  }, [selectedSenderPortfolio, selectedLegs, index, selectedAssets]);

  return (
    <AssetForm
      index={index.toString()}
      assets={assets}
      collections={collections}
      nfts={nfts}
      getNftsPerCollection={getAvailableNfts}
      handleDeleteAsset={handleDeleteLeg}
      handleSelectAsset={handleUpdateLegAsset}
      assetBalance={balance}
      disabled={!selectedSenderPortfolio?.id}
      portfolioName={portfolioName}
      maxNfts={MAX_NFTS_PER_LEG}
      indexArray={legIndexes}
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
        {!shouldHideSenderPortfolio && !portfolioLoading.sender ? (
          <DropdownSelect
            label="Sending Portfolio"
            placeholder="Select portfolio"
            options={senderPortfolios.map(({ id, name }) =>
              id === 'default' ? name : `${id} / ${name}`,
            )}
            onChange={(option) => handlePortfolioSelect(option, 'sender')}
            removeSelection={!selectedSenderPortfolio}
            error={undefined}
            enableSearch
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
        {!shouldHideReceiverPortfolio && !portfolioLoading.receiver ? (
          <DropdownSelect
            label="Receiving Portfolio"
            placeholder="Select portfolio"
            options={receiverPortfolios.map(({ id, name }) =>
              id === 'default' ? name : `${id} / ${name}`,
            )}
            onChange={(option) => handlePortfolioSelect(option, 'receiver')}
            removeSelection={!selectedReceiverPortfolio}
            error={undefined}
            enableSearch
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
