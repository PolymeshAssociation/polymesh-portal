/* eslint-disable no-case-declarations */
import { useState, useRef, useEffect, useContext } from 'react';
import { Asset, Identity } from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { Icon } from '~/components';
import { DropdownSelect, SkeletonLoader, Text } from '~/components/UiKit';
import {
  StyledAmountInput,
  InputWrapper,
  StyledLabel,
  StyledInput,
  StyledAssetSelect,
  StyledPlaceholder,
  StyledWrapper,
  AssetWrapper,
  AssetSelectWrapper,
  StyledExpandedSelect,
  StyledSelectOption,
  IconWrapper,
  SelectedOption,
  StyledAvailableBalance,
  StyledError,
  CloseButton,
  UseMaxButton,
  FlexWrapper,
} from './styles';
import { formatBalance, stringToColor } from '~/helpers/formatters';
import { ISelectedLeg } from './types';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { PolymeshContext } from '~/context/PolymeshContext';
import {
  getPortfolioDataFromIdentity,
  checkAvailableBalance,
  validateTotalSelected,
} from './helpers';
import { notifyError } from '~/helpers/notifications';

interface ILegSelectProps {
  index: number;
  handleAdd: (item: ISelectedLeg) => void;
  handleDelete?: (index: number) => void;
  handleResetAmount?: (index: number) => void;
  selectedLegs: ISelectedLeg[];
}

const LegSelect: React.FC<ILegSelectProps> = ({
  index,
  handleAdd,
  handleDelete,
  handleResetAmount,
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
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [initialFreeBalance, setInitialFreeBalance] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState('');
  const [validationError, setValidationError] = useState('');
  const [assetSelectExpanded, setAssetSelectExpanded] = useState(false);
  const [selectedAssetIsDivisible, setSelectedAssetIsDivisible] =
    useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedAsset) return;

    const getAssetDetails = async () => {
      const assetDetails = await selectedAsset.details();
      setSelectedAssetIsDivisible(assetDetails.isDivisible);
    };

    getAssetDetails();
  }, [selectedAsset]);

  useEffect(() => {
    if (!selectedSenderPortfolio) return;

    setSelectedAsset(null);
  }, [selectedSenderPortfolio]);

  useEffect(() => {
    const handleClickOutside: EventListenerOrEventListenerObject = (event) => {
      if (ref.current && !ref.current.contains(event.target as Node | null)) {
        setAssetSelectExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

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
        setSelectedAsset(null);
        setAvailableBalance(0);
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

  const validateInput = (inputValue: string) => {
    if (!selectedSenderPortfolio) return;

    const amount = Number(inputValue);
    let error = '';

    if (Number.isNaN(amount)) {
      error = 'Amount must be a number';
    } else if (!inputValue) {
      error = 'Amount is required';
    } else if (amount <= 0) {
      error = 'Amount must be greater than zero';
    } else if (
      validateTotalSelected({
        asset: selectedAsset as Asset,
        selectedLegs,
        sender: selectedSenderPortfolio.portfolio.toHuman().did,
        portfolioId: selectedSenderPortfolio.id,
        inputValue,
        initialFreeBalance,
        index,
      })
    ) {
      error = 'Insufficient balance';
    } else if (!selectedAssetIsDivisible && inputValue.indexOf('.') !== -1) {
      error = 'Asset does not allow decimal places';
    } else if (
      inputValue.indexOf('.') !== -1 &&
      inputValue.substring(inputValue.indexOf('.') + 1).length > 6
    ) {
      error = 'Amount must have at most 6 decimal places';
    }

    setValidationError(error);

    handleAdd({
      asset: (selectedAsset as Asset).toHuman(),
      amount: error ? 0 : amount,
      index,
      from: (selectedSenderPortfolio as IPortfolioData).portfolio,
      to: (selectedReceiverPortfolio as IPortfolioData).portfolio,
    });
  };

  const toggleAssetSelectDropdown = () =>
    setAssetSelectExpanded((prev) => !prev);

  const handlePortfolioSelect = (
    combinedId: string,
    role: 'sender' | 'receiver',
  ) => {
    if (!combinedId) return;

    const id = combinedId.split('/')[0].trim();

    switch (role) {
      case 'sender':
        setSelectedAmount('');
        if (handleResetAmount) {
          handleResetAmount(index);
        }
        const selectedSendingPortfolio = senderPortfolios.find((item) => {
          return Number.isNaN(Number(id))
            ? item.id === 'default'
            : item.id === id;
        });
        if (selectedSendingPortfolio) {
          setSelectedSenderPortfolio(selectedSendingPortfolio);
        }
        break;

      case 'receiver':
        const selectedReceivingPortfolio = receiverPortfolios.find((item) => {
          return Number.isNaN(Number(id))
            ? item.id === 'default'
            : item.id === id;
        });
        if (selectedReceivingPortfolio) {
          setSelectedReceiverPortfolio(selectedReceivingPortfolio);
        }
        break;

      default:
        break;
    }
  };

  const handleAssetSelect = (asset: Asset, balance: BigNumber) => {
    if (!selectedSenderPortfolio || !selectedReceiverPortfolio) return;

    setSelectedAsset(asset);
    setInitialFreeBalance(balance.toNumber());
    const availableAmount = checkAvailableBalance({
      asset,
      balance,
      selectedLegs,
      sender: selectedSenderPortfolio.portfolio.toHuman().did,
      portfolioId: selectedSenderPortfolio.id,
    });
    setAvailableBalance(availableAmount);

    setSelectedAmount('');
    handleAdd({
      asset: asset.toHuman(),
      amount: 0,
      index,
      from: selectedSenderPortfolio.portfolio,
      to: selectedReceiverPortfolio.portfolio,
    });
    toggleAssetSelectDropdown();
  };

  const handleAmountChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    setSelectedAmount(target.value);
    validateInput(target.value);
  };

  const handleUseMax = () => {
    const balance =
      selectedAmount && !validationError
        ? Number(selectedAmount) + availableBalance
        : availableBalance;

    setSelectedAmount(balance.toString());
    validateInput(balance.toString());
  };

  useEffect(() => {
    if (
      !selectedAsset ||
      !selectedSenderPortfolio ||
      !selectedLegs.find((leg) => leg.index === index)
    )
      return;

    const availableAmount = checkAvailableBalance({
      asset: selectedAsset,
      balance: initialFreeBalance,
      selectedLegs,
      sender: selectedSenderPortfolio.portfolio.toHuman().did,
      portfolioId: selectedSenderPortfolio.id,
    });

    setAvailableBalance(availableAmount);
  }, [
    index,
    initialFreeBalance,
    selectedAmount,
    selectedAsset,
    selectedLegs,
    selectedSenderPortfolio,
  ]);

  const disableAmountInput = selectedAmount
    ? false
    : !selectedAsset || !availableBalance;

  return (
    <StyledWrapper>
      {!!index && (
        <CloseButton
          onClick={handleDelete ? () => handleDelete(index) : undefined}
        >
          <Icon name="CloseIcon" size="16px" />
        </CloseButton>
      )}

      <FlexWrapper marginBottom={16}>
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
            <StyledPlaceholder isAbsolute>
              {portfolioLoading.sender ? (
                <SkeletonLoader height={16} />
              ) : (
                'Enter Sender DID'
              )}
            </StyledPlaceholder>
          </InputWrapper>
        )}
      </FlexWrapper>
      <FlexWrapper marginBottom={16}>
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
            <StyledPlaceholder isAbsolute>
              {portfolioLoading.receiver ? (
                <SkeletonLoader height={16} />
              ) : (
                'Enter Receiver DID'
              )}
            </StyledPlaceholder>
          </InputWrapper>
        )}
      </FlexWrapper>
      <AssetWrapper>
        <div>
          <Text size="medium" bold marginBottom={3}>
            Asset
          </Text>
          <AssetSelectWrapper ref={ref}>
            <StyledAssetSelect
              onClick={toggleAssetSelectDropdown}
              expanded={assetSelectExpanded}
              isDisabled={
                !selectedSenderPortfolio || !selectedReceiverPortfolio
              }
            >
              {selectedSenderPortfolio &&
              selectedSenderPortfolio.assets.length &&
              selectedAsset ? (
                <SelectedOption>
                  <IconWrapper
                    background={stringToColor(selectedAsset.toHuman())}
                  >
                    <Icon name="Coins" size="16px" />
                  </IconWrapper>
                  {selectedAsset.toHuman()}
                </SelectedOption>
              ) : (
                <StyledPlaceholder>Select Asset</StyledPlaceholder>
              )}
              <Icon name="ExpandIcon" className="expand-icon" size="18px" />
            </StyledAssetSelect>
            {selectedSenderPortfolio && assetSelectExpanded && (
              <StyledExpandedSelect>
                {selectedSenderPortfolio.assets.length ? (
                  selectedSenderPortfolio.assets.map(({ asset, free }) => (
                    <StyledSelectOption
                      key={asset.toHuman()}
                      onClick={() => handleAssetSelect(asset, free)}
                    >
                      <IconWrapper background={stringToColor(asset.toHuman())}>
                        <Icon name="Coins" size="16px" />
                      </IconWrapper>{' '}
                      {asset.toHuman()}
                    </StyledSelectOption>
                  ))
                ) : (
                  <StyledPlaceholder>No assets available</StyledPlaceholder>
                )}
              </StyledExpandedSelect>
            )}
          </AssetSelectWrapper>
        </div>
        <div>
          <InputWrapper>
            <Text size="medium" bold marginBottom={3}>
              Amount
            </Text>
            <StyledAmountInput
              name="amount"
              placeholder="Enter Amount"
              value={selectedAmount}
              onChange={handleAmountChange}
              disabled={disableAmountInput}
            />
            {!!selectedAsset &&
              Number(selectedAmount) < availableBalance &&
              !!availableBalance && (
                <UseMaxButton onClick={handleUseMax}>Use max</UseMaxButton>
              )}
          </InputWrapper>
        </div>
      </AssetWrapper>
      {!!validationError && <StyledError>{validationError}</StyledError>}
      {!!selectedSenderPortfolio?.assets?.length && !!selectedAsset && (
        <StyledAvailableBalance>
          <Text>Available balance:</Text>
          <Text>{formatBalance(availableBalance)}</Text>
        </StyledAvailableBalance>
      )}
    </StyledWrapper>
  );
};

export default LegSelect;
