import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  FungibleAsset,
  Identity,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TSelectedAsset } from '~/components/AssetForm/constants';
import { IAccountAssetSource } from '~/components/AssetForm/hooks';
import { DropdownSelect, SkeletonLoader } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { notifyError } from '~/helpers/notifications';
import AssetForm from '../AssetForm';
import { INonFungibleAsset, MAX_NFTS_PER_LEG } from '../AssetForm/constants';
import { useAssetForm } from '../AssetForm/hooks';
import { checkAvailableBalance, getPortfolioDataFromIdentity } from './helpers';
import {
  FlexWrapper,
  InputWrapper,
  StyledError,
  StyledInput,
  StyledLabel,
  StyledPlaceholder,
} from './styles';
import { TSelectedLeg } from './types';

interface ILegSelectProps {
  index: number;
  handleUpdateLeg: (index: number, item: TSelectedLeg) => void;
  handleDelete: (index: number) => void;
  selectedLegs: TSelectedLeg[];
  legIndexes: number[];
  onValidityChange?: (index: number, isValid: boolean) => void;
}

const LegSelect: React.FC<ILegSelectProps> = ({
  index,
  handleUpdateLeg,
  handleDelete,
  selectedLegs,
  legIndexes,
  onValidityChange,
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

  const [selectedSenderSource, setSelectedSenderSource] = useState<
    IPortfolioData | IAccountAssetSource | null
  >(null);
  const [selectedReceiverSource, setSelectedReceiverSource] = useState<
    IPortfolioData | IAccountAssetSource | null
  >(null);
  const [senderAccountsData, setSenderAccountsData] = useState<
    IAccountAssetSource[]
  >([]);
  const [receiverAccountsData, setReceiverAccountsData] = useState<
    IAccountAssetSource[]
  >([]);
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
  } = useAssetForm(selectedSenderSource, index);

  const selectedLeg = useMemo(() => {
    return selectedLegs.find((leg) => leg.index === index);
  }, [selectedLegs, index]);

  // Keep a ref of latest selectedLegs to avoid stale closures in callbacks
  const selectedLegsRef = useRef<TSelectedLeg[]>(selectedLegs);
  selectedLegsRef.current = selectedLegs;

  // Helper to retrieve the most up-to-date leg for this index
  const getCurrentLeg = useCallback((): TSelectedLeg | undefined => {
    return selectedLegsRef.current.find((leg) => leg.index === index);
  }, [index]);

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
    accountsData: IAccountAssetSource[] = [],
  ) => {
    if (role === 'sender') {
      setSelectedSenderSource(null);
      setShouldHideSenderPortfolio(hidePortfolio);
      setSenderIdentity(identity);
      setSenderPortfolios(portfolios);
      setSenderAccountsData(accountsData);
    } else {
      setSelectedReceiverSource(null);
      setShouldHideReceiverPortfolio(hidePortfolio);
      setReceiverIdentity(identity);
      setReceiverPortfolios(portfolios);
      setReceiverAccountsData(accountsData);
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
      const currentLeg = getCurrentLeg();
      if (currentLeg) {
        const updatedLeg = removePropertiesFromLeg(currentLeg, role);
        handleUpdateLeg(Number(index), updatedLeg as TSelectedLeg);
      }

      setRoleSpecificState(role, null, true, []);
    },
    [getCurrentLeg, handleUpdateLeg, index],
  );

  // Helper function to handle an invalid portfolio scenario
  const handleInvalidPortfolio = useCallback(
    (role: 'sender' | 'receiver') => {
      const currentLeg = getCurrentLeg();
      if (currentLeg) {
        const updatedLeg = removePropertiesFromLeg(currentLeg, role);
        handleUpdateLeg(Number(index), updatedLeg as TSelectedLeg);
      }
      const identity = role === 'sender' ? senderIdentity : receiverIdentity;
      const portfolios =
        role === 'sender' ? senderPortfolios : receiverPortfolios;
      const accountsData =
        role === 'sender' ? senderAccountsData : receiverAccountsData;

      setRoleSpecificState(role, identity, false, portfolios, accountsData);
    },
    [
      getCurrentLeg,
      handleUpdateLeg,
      index,
      receiverIdentity,
      receiverPortfolios,
      receiverAccountsData,
      senderIdentity,
      senderPortfolios,
      senderAccountsData,
    ],
  );

  // Helper function to fetch identity and portfolios
  const fetchIdentityAndPortfolios = useCallback(
    async (did: string, role: 'sender' | 'receiver') => {
      if (!sdk) return;

      try {
        setPortfolioLoading((prev) => ({ ...prev, [role]: true }));

        const identity = await sdk.identities.getIdentity({ did });

        const [portfolios, primaryAccData, secondaryAccsData] =
          await Promise.all([
            getPortfolioDataFromIdentity(identity),
            identity.getPrimaryAccount(),
            identity.getSecondaryAccounts({ size: new BigNumber(500) }),
          ]);

        const allAccs = [
          primaryAccData.account,
          ...secondaryAccsData.data.map((a) => a.account),
        ];

        // For sender fetch balances; for receiver just use the address
        const accountsData = await Promise.all(
          allAccs.map(async (acc) => {
            if (role === 'sender') {
              const [accAssets, accountCollections] = await Promise.all([
                acc
                  .getAssetBalances()
                  .then((r) => r.filter(({ total }) => total.toNumber() > 0)),
                acc
                  .getCollections()
                  .then((r) => r.filter(({ total }) => total.toNumber() > 0)),
              ]);
              return {
                name: `account / ${acc.address}`,
                address: acc.address,
                assets: accAssets,
                accountCollections,
              } as IAccountAssetSource;
            }
            return {
              name: `account / ${acc.address}`,
              address: acc.address,
              assets: [],
              accountCollections: [],
            } as IAccountAssetSource;
          }),
        );

        setRoleSpecificState(role, identity, false, portfolios, accountsData);

        const currentLeg = getCurrentLeg();
        if (currentLeg) {
          const updatedLeg = removePropertiesFromLeg(currentLeg, role);
          handleUpdateLeg(Number(index), updatedLeg as TSelectedLeg);
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setPortfolioLoading((prev) => ({ ...prev, [role]: false }));
      }
    },
    [getCurrentLeg, handleUpdateLeg, index, sdk],
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

  // Handle direct account address input (non-DID)
  const handleAddressInput = useCallback(
    async (address: string, role: 'sender' | 'receiver') => {
      if (!sdk) return;
      try {
        setPortfolioLoading((prev) => ({ ...prev, [role]: true }));

        const acc = await sdk.accountManagement.getAccount({ address });

        let accountSource: IAccountAssetSource;
        if (role === 'sender') {
          const [accAssets, accountCollections] = await Promise.all([
            acc
              .getAssetBalances()
              .then((r) => r.filter(({ total }) => total.toNumber() > 0)),
            acc
              .getCollections()
              .then((r) => r.filter(({ total }) => total.toNumber() > 0)),
          ]);
          accountSource = {
            name: 'Account',
            address,
            assets: accAssets,
            accountCollections,
          };
        } else {
          accountSource = {
            name: 'Account',
            address,
            assets: [],
            accountCollections: [],
          };
        }

        const currentLeg = getCurrentLeg() || { index };
        handleUpdateLeg(Number(index), {
          ...currentLeg,
          [role === 'sender' ? 'from' : 'to']: address,
        } as TSelectedLeg);

        const identity = await acc.getIdentity();
        const otherIdentity =
          role === 'sender' ? receiverIdentity : senderIdentity;
        const isSameDID =
          identity !== null &&
          otherIdentity !== null &&
          identity.did === otherIdentity.did;

        if (role === 'sender') {
          setSelectedSenderSource(accountSource);
          setSenderIdentity(identity);
          setSenderPortfolios([]);
          setSenderAccountsData([]);
          setShouldHideSenderPortfolio(true);
          setIdentityError((prev) =>
            isSameDID
              ? {
                  sender: 'Cannot also be receiver',
                  receiver: 'Cannot also be sender',
                }
              : {
                  sender: '',
                  receiver:
                    prev.receiver === 'Cannot also be sender'
                      ? ''
                      : prev.receiver,
                },
          );
        } else {
          setSelectedReceiverSource(accountSource);
          setReceiverIdentity(identity);
          setReceiverPortfolios([]);
          setReceiverAccountsData([]);
          setShouldHideReceiverPortfolio(true);
          setIdentityError((prev) =>
            isSameDID
              ? {
                  sender: 'Cannot also be receiver',
                  receiver: 'Cannot also be sender',
                }
              : {
                  receiver: '',
                  sender:
                    prev.sender === 'Cannot also be receiver'
                      ? ''
                      : prev.sender,
                },
          );
        }
      } catch (error) {
        setIdentityError((prev) => ({
          ...prev,
          [role]: 'Invalid account address',
        }));
        handleInvalidIdentity(role);
      } finally {
        setPortfolioLoading((prev) => ({ ...prev, [role]: false }));
      }
    },
    [
      getCurrentLeg,
      handleInvalidIdentity,
      handleUpdateLeg,
      index,
      receiverIdentity,
      senderIdentity,
      sdk,
    ],
  );

  // Main function for handling identity selection
  const handleIdentitySelect = useCallback(
    async (input: string, role: 'sender' | 'receiver') => {
      if (!sdk) return;

      if (/^0x[0-9a-fA-F]{64}$/.test(input)) {
        const isValidDid = await validateDid(input, role);
        if (!isValidDid) {
          handleInvalidIdentity(role);
          return;
        }

        if (isSameIdentity(input, role)) return;

        if (isSenderEqualReceiver(input, role)) {
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

        await fetchIdentityAndPortfolios(input, role);
        return;
      }

      if (!input.length) {
        setIdentityError((prev) => ({
          ...prev,
          [role]: 'DID or address is required',
        }));
        handleInvalidIdentity(role);
        return;
      }

      await handleAddressInput(input, role);
    },
    [
      fetchIdentityAndPortfolios,
      handleAddressInput,
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
          setSelectedSenderSource(null);
          handleInvalidPortfolio(role);
        }
        if (role === 'receiver') {
          setSelectedReceiverSource(null);
          handleInvalidPortfolio(role);
        }
        return;
      }

      const id = combinedId.split('/')[0].trim();

      switch (role) {
        case 'sender': {
          if (id === 'account') {
            const address = combinedId.replace(/^account \/ /, '');
            const accSource = senderAccountsData.find(
              (a) => a.address === address,
            );
            if (accSource) {
              setSelectedSenderSource(accSource);
              const currentLeg = getCurrentLeg() || { index };
              handleUpdateLeg(index, {
                ...currentLeg,
                from: address,
              } as TSelectedLeg);
            }
            break;
          }
          const selectedSendingPortfolio = senderPortfolios.find((item) => {
            return Number.isNaN(Number(id))
              ? item.id === 'default'
              : item.id === id;
          });
          if (selectedSendingPortfolio) {
            setSelectedSenderSource(selectedSendingPortfolio);
            // Use a function to get the most current selectedLegs state
            const currentLeg = getCurrentLeg() || { index };
            const updatedLeg = {
              ...currentLeg,
              from: selectedSendingPortfolio.portfolio,
            } as TSelectedLeg;
            handleUpdateLeg(index, updatedLeg);
          }
          break;
        }
        case 'receiver': {
          if (id === 'account') {
            const address = combinedId.replace(/^account \/ /, '');
            const accSource = receiverAccountsData.find(
              (a) => a.address === address,
            );
            if (accSource) {
              setSelectedReceiverSource(accSource);
              const currentLeg = getCurrentLeg() || { index };
              handleUpdateLeg(index, {
                ...currentLeg,
                to: address,
              } as TSelectedLeg);
            }
            break;
          }
          const selectedReceivingPortfolio = receiverPortfolios.find((item) => {
            return Number.isNaN(Number(id))
              ? item.id === 'default'
              : item.id === id;
          });
          if (selectedReceivingPortfolio) {
            setSelectedReceiverSource(selectedReceivingPortfolio);
            // Use a function to get the most current selectedLegs state
            const currentLeg = getCurrentLeg() || { index };
            const updatedLeg = {
              ...currentLeg,
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
      receiverAccountsData,
      getCurrentLeg,
      senderPortfolios,
      senderAccountsData,
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

  useEffect(() => {
    const hasSameDIDError =
      identityError.sender === 'Cannot also be receiver' ||
      identityError.receiver === 'Cannot also be sender';
    onValidityChange?.(index, !hasSameDIDError);
  }, [identityError, index, onValidityChange]);

  const getAvailableNfts = useCallback(
    (collectionId?: string) => {
      if (!selectedSenderSource || !collectionId) return [];
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
      selectedSenderSource,
    ],
  );

  const balance = useMemo(() => {
    if (!selectedSenderSource) return 0;

    const isAccountSource = 'accountCollections' in selectedSenderSource;
    const currentAsset = selectedSenderSource.assets.find(
      (asset) => asset.asset.id === selectedAssets[index].asset,
    );
    if (!currentAsset) return 0;

    return checkAvailableBalance({
      asset: currentAsset.asset as FungibleAsset,
      balance: currentAsset.free || 0,
      selectedLegs,
      sender: isAccountSource
        ? (selectedSenderSource as IAccountAssetSource).address
        : (selectedSenderSource as IPortfolioData).portfolio.owner.did,
      portfolioId: isAccountSource
        ? 'account'
        : (selectedSenderSource as IPortfolioData).id,
      assetIndex: index,
    });
  }, [selectedSenderSource, selectedLegs, index, selectedAssets]);

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
      disabled={!selectedSenderSource}
      portfolioName={portfolioName}
      maxNfts={MAX_NFTS_PER_LEG}
      indexArray={legIndexes}
    >
      <FlexWrapper $marginBottom={16}>
        <InputWrapper>
          <StyledLabel>Sender</StyledLabel>
          <StyledInput
            placeholder="Sender DID or account address"
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
            label="Sending From"
            placeholder="Select portfolio or account"
            options={[
              ...senderPortfolios.map(({ id, name }) =>
                id === 'default' ? 'Default Portfolio' : `${id} / ${name}`,
              ),
              ...senderAccountsData.map(
                ({ address }) => `account / ${address}`,
              ),
            ]}
            onChange={(option) => handlePortfolioSelect(option, 'sender')}
            removeSelection={!selectedSenderSource}
            error={undefined}
            enableSearch
          />
        ) : (
          <InputWrapper>
            <StyledPlaceholder $isAbsolute>
              {(() => {
                if (portfolioLoading.sender)
                  return <SkeletonLoader height={16} />;
                if (
                  selectedSenderSource &&
                  'accountCollections' in selectedSenderSource
                )
                  return 'Account';
                return 'Enter Sender DID or account address';
              })()}
            </StyledPlaceholder>
          </InputWrapper>
        )}
      </FlexWrapper>
      <FlexWrapper $marginBottom={16}>
        <InputWrapper>
          <StyledLabel>Receiver</StyledLabel>
          <StyledInput
            placeholder="Receiver DID or account address"
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
            label="Receiving At"
            placeholder="Select portfolio or account"
            options={[
              ...receiverPortfolios.map(({ id, name }) =>
                id === 'default' ? name : `${id} / ${name}`,
              ),
              ...receiverAccountsData.map(
                ({ address }) => `account / ${address}`,
              ),
            ]}
            onChange={(option) => handlePortfolioSelect(option, 'receiver')}
            removeSelection={!selectedReceiverSource}
            error={undefined}
            enableSearch
          />
        ) : (
          <InputWrapper>
            <StyledPlaceholder $isAbsolute>
              {(() => {
                if (portfolioLoading.receiver)
                  return <SkeletonLoader height={16} />;
                if (
                  selectedReceiverSource &&
                  'accountCollections' in selectedReceiverSource
                )
                  return 'Account';
                return 'Enter Receiver DID or account address';
              })()}
            </StyledPlaceholder>
          </InputWrapper>
        )}
      </FlexWrapper>
    </AssetForm>
  );
};

export default LegSelect;
