/* eslint-disable react/jsx-props-no-spreading */
import { Venue, VenueDetails } from '@polymeshassociation/polymesh-sdk/types';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import AssetForm from '~/components/AssetForm';
import { MAX_NFTS_PER_LEG } from '~/components/AssetForm/constants';
import {
  IAccountAssetSource,
  useAssetForm,
} from '~/components/AssetForm/hooks';
import { Button, DropdownSelect } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { InstructionsContext } from '~/context/InstructionsContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { useWindowWidth } from '~/hooks/utility';
import {
  StyledButtonsWrapper,
  StyledInput,
  StyledLabel,
} from '../../../styles';
import { InputWrapper, StyledErrorMessage } from '../../styles';
import { createBasicFormConfig, IBasicFieldValues } from '../config';
import { createBasicInstructionParams } from '../helpers';

interface IBasicFormProps {
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}

interface IVenueWithDetails {
  venue: Venue;
  details: VenueDetails;
}

export const BasicForm: React.FC<IBasicFormProps> = ({ toggleModal }) => {
  const { createdVenues, instructionsLoading, refreshInstructions } =
    useContext(InstructionsContext);
  const { allPortfolios, allAccountsData } = useContext(PortfolioContext);
  const { selectedAccount } = useContext(AccountContext);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const sdkRef = useRef(sdk);
  sdkRef.current = sdk;

  const formConfigRef = useRef<ReturnType<typeof createBasicFormConfig> | null>(
    null,
  );
  if (formConfigRef.current === null) {
    formConfigRef.current = createBasicFormConfig((address) => {
      const currentSdk = sdkRef.current;
      if (!currentSdk) return false;
      try {
        return currentSdk.accountManagement.isValidAddress({ address });
      } catch {
        return false;
      }
    });
  }

  const accountData = allAccountsData[selectedAccount];
  const hasAccountAssets = !!(
    accountData &&
    (accountData.assets.length > 0 || accountData.collections.length > 0)
  );

  const [removeSelection, setRemoveSelection] = useState<boolean>(false);
  const [venues, setVenues] = useState<IVenueWithDetails[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [senderSource, setSenderSource] = useState<
    IPortfolioData | IAccountAssetSource | null
  >(allPortfolios[0] ?? null);
  const [recipientDIDError, setRecipientDIDError] = useState('');

  const { isMobile } = useWindowWidth();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<IBasicFieldValues>(formConfigRef.current);
  const { executeTransaction, isTransactionInProgress } =
    useTransactionStatusContext();
  const {
    assets,
    collections,
    selectedAssets,
    getAssetBalance,
    nfts,
    getNftsPerCollection,
    handleDeleteAsset,
    handleSelectAsset,
  } = useAssetForm(senderSource);

  useEffect(() => {
    if (instructionsLoading) return;

    (async () => {
      const venuesWithDetails = await Promise.all(
        createdVenues.map(async (venue) => ({
          venue,
          details: await venue.details(),
        })),
      );

      setVenues(venuesWithDetails);
    })();
  }, [createdVenues, instructionsLoading]);

  const venueSelectOptions = useMemo(() => {
    return selectedVenue
      ? [
          'Clear selection (No Venue)',
          ...venues.map(
            ({ venue, details }) =>
              `${venue.toHuman()} / ${details.description}`,
          ),
        ]
      : venues.map(
          ({ venue, details }) => `${venue.toHuman()} / ${details.description}`,
        );
  }, [venues, selectedVenue]);

  const handleVenueSelect = useCallback(
    (idWithDescription: string | null) => {
      if (
        !idWithDescription ||
        idWithDescription === 'Clear selection (No Venue)'
      ) {
        setRemoveSelection(true);
        setValue('venue', '', { shouldValidate: true });
        setSelectedVenue(null);
        return;
      }
      setRemoveSelection(false);
      setValue('venue', idWithDescription, { shouldValidate: true });

      const id = idWithDescription.split('/')[0].trim();
      const venueToSelect = createdVenues.find(
        (venue) => id === venue.toHuman(),
      );
      if (venueToSelect) {
        setSelectedVenue(venueToSelect);
      }
    },
    [createdVenues, setValue],
  );

  const getSenderDid = useCallback(async (): Promise<string | null> => {
    if (!senderSource || !sdk) return null;
    if ('accountCollections' in senderSource) {
      const acc = await sdk.accountManagement.getAccount({
        address: (senderSource as IAccountAssetSource).address,
      });
      const identity = await acc.getIdentity();
      return identity?.did ?? null;
    }
    return (senderSource as IPortfolioData).portfolio.owner.did;
  }, [senderSource, sdk]);

  const handleRecipientBlur = useCallback(
    async (value: string) => {
      if (!value || !sdk) {
        setRecipientDIDError('');
        return;
      }
      try {
        let recipientDid: string | null = null;
        if (/^0x[0-9a-fA-F]{64}$/.test(value)) {
          recipientDid = value;
        } else if (sdk.accountManagement.isValidAddress({ address: value })) {
          const acc = await sdk.accountManagement.getAccount({
            address: value,
          });
          const identity = await acc.getIdentity();
          recipientDid = identity?.did ?? null;
        } else {
          setRecipientDIDError('');
          return;
        }

        if (recipientDid === null) {
          setRecipientDIDError('');
          return;
        }

        const senderDid = await getSenderDid();
        if (senderDid !== null && senderDid === recipientDid) {
          setRecipientDIDError(
            'Recipient belongs to the same identity as the sender. Transfers within the same identity are not permitted for settlements.',
          );
        } else {
          setRecipientDIDError('');
        }
      } catch {
        setRecipientDIDError('');
      }
    },
    [getSenderDid, sdk],
  );

  const handleSenderSelect = useCallback(
    (combinedId: string | null) => {
      if (!combinedId) {
        setSenderSource(null);
        setValue('senderPortfolio', '', { shouldValidate: true });
        return;
      }

      if (combinedId === 'Account') {
        if (accountData) {
          setSenderSource({
            name: 'Account',
            address: selectedAccount,
            assets: accountData.assets,
            accountCollections: accountData.collections,
          });
          setValue('senderPortfolio', 'account', { shouldValidate: true });
        }
        return;
      }

      const id = combinedId.split('/')[0].trim();
      const selectedSendingPortfolio = allPortfolios.find((item) =>
        Number.isNaN(Number(id)) ? item.id === 'default' : item.id === id,
      );
      if (selectedSendingPortfolio) {
        setSenderSource(selectedSendingPortfolio);
        setValue('senderPortfolio', selectedSendingPortfolio.id, {
          shouldValidate: true,
        });
      } else {
        setSenderSource(null);
        setValue('senderPortfolio', '', { shouldValidate: true });
      }
    },
    [accountData, allPortfolios, selectedAccount, setValue],
  );

  const onSubmit = async (formData: IBasicFieldValues) => {
    if (!senderSource || !sdk) return;

    const isAccountSender = 'accountCollections' in senderSource;

    try {
      const transactionPromise = sdk.settlements.addInstruction(
        createBasicInstructionParams({
          selectedAssets: Object.values(selectedAssets),
          selectedPortfolio: isAccountSender
            ? undefined
            : (senderSource as IPortfolioData),
          senderAddress: isAccountSender
            ? (senderSource as IAccountAssetSource).address
            : undefined,
          formData,
        }),
      );

      await executeTransaction(transactionPromise, {
        onTransactionRunning: () => {
          reset();
          toggleModal();
        },
        onSuccess: async () => {
          refreshInstructions();
        },
      });
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const isDataValid = useMemo(() => {
    return (
      isValid &&
      !recipientDIDError &&
      !!senderSource &&
      !!Object.keys(selectedAssets).length &&
      !Object.values(selectedAssets).some((asset) => {
        if ('amount' in asset) {
          return asset.amount.toNumber() <= 0;
        }
        return !asset.nfts?.length;
      })
    );
  }, [isValid, recipientDIDError, senderSource, selectedAssets]);

  const getSenderLabel = (
    source: IPortfolioData | IAccountAssetSource | null,
  ): string | undefined => {
    if (!source) return undefined;
    if ('accountCollections' in source) return 'Account';
    const portfolio = source as IPortfolioData;
    if (portfolio.id === 'default') return portfolio.name;
    return `${portfolio.id} / ${portfolio.name}`;
  };

  return (
    <>
      <InputWrapper $marginBottom={24}>
        {venueSelectOptions.length > 0 && (
          <DropdownSelect
            label="Venue (Optional)"
            placeholder="Select venue"
            onChange={handleVenueSelect}
            options={venueSelectOptions}
            error={errors?.venue?.message}
            removeSelection={removeSelection}
          />
        )}
      </InputWrapper>
      {allPortfolios.length + (hasAccountAssets ? 1 : 0) > 1 && (
        <InputWrapper $marginBottom={24}>
          <DropdownSelect
            selected={getSenderLabel(senderSource)}
            label="Sending From"
            placeholder="Select portfolio or account"
            onChange={handleSenderSelect}
            options={[
              ...allPortfolios.map(({ id, name }) =>
                id === 'default' ? 'Default Portfolio' : `${id} / ${name}`,
              ),
              ...(hasAccountAssets ? ['Account'] : []),
            ]}
            error={undefined}
            enableSearch
          />
          {!!errors?.senderPortfolio?.message && (
            <StyledErrorMessage>
              {errors?.senderPortfolio?.message as string}
            </StyledErrorMessage>
          )}
        </InputWrapper>
      )}
      <InputWrapper $marginBottom={24}>
        <StyledLabel htmlFor="recipient">Recipient</StyledLabel>
        <StyledInput
          id="recipient"
          placeholder="Enter recipient DID or account address"
          {...register('recipient')}
          onBlur={(e) => {
            register('recipient').onBlur(e);
            handleRecipientBlur(e.target.value);
          }}
        />
        {!!errors?.recipient?.message && (
          <StyledErrorMessage>
            {errors?.recipient?.message as string}
          </StyledErrorMessage>
        )}
        {!errors?.recipient?.message && !!recipientDIDError && (
          <StyledErrorMessage>{recipientDIDError}</StyledErrorMessage>
        )}
      </InputWrapper>
      <InputWrapper $marginBottom={24}>
        <StyledLabel htmlFor="memo">
          Memo (Optional - this will be public)
        </StyledLabel>
        <StyledInput id="memo" placeholder="Enter memo" {...register('memo')} />
        {!!errors?.memo?.message && (
          <StyledErrorMessage>
            {errors?.memo?.message as string}
          </StyledErrorMessage>
        )}
      </InputWrapper>

      {Object.keys(selectedAssets).map((asset) => (
        <AssetForm
          key={asset}
          index={asset}
          assets={assets}
          collections={collections}
          portfolioName={senderSource?.name || ''}
          nfts={nfts}
          getNftsPerCollection={getNftsPerCollection}
          handleDeleteAsset={handleDeleteAsset}
          handleSelectAsset={handleSelectAsset}
          assetBalance={getAssetBalance(selectedAssets[asset].asset)}
          maxNfts={MAX_NFTS_PER_LEG}
        />
      ))}

      <StyledButtonsWrapper>
        {!isMobile && (
          <Button variant="modalSecondary" onClick={toggleModal}>
            Cancel
          </Button>
        )}
        <Button
          variant="modalPrimary"
          disabled={!isDataValid || isTransactionInProgress}
          onClick={handleSubmit(onSubmit)}
        >
          Send
        </Button>
      </StyledButtonsWrapper>
    </>
  );
};
