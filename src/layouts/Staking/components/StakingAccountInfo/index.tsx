import { useContext, useEffect, useRef, useState } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { Text, Heading, Button, SkeletonLoader } from '~/components/UiKit';
import {
  StyledWrapper,
  StyledButtonWrapper,
  IconWrapper,
  StyledTopInfo,
  StyledTextWrapper,
  Label,
  StyledNameOrKey,
  StyledAccountItemWrapper,
  Value,
} from './styles';
import { formatBalance, formatKey } from '~/helpers/formatters';
import { StakingContext } from '~/context/StakingContext';
import { Icon, CopyToClipboard } from '~/components';
import { useWindowWidth } from '~/hooks/utility';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import Unbonding from './components/Unbonding';
import ExpandableOperators from './components/ExpandableOperators';
import Tooltip from '~/components/UiKit/Tooltip';

export const StakingAccountInfo = () => {
  const { stakingAccountInfo } = useContext(StakingContext);
  const { identityLoading, identity, allAccountsWithMeta } =
    useContext(AccountContext);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const {
    stashAddress,
    controllerAddress,
    totalBonded,
    amountUnbonding,
    amountAvailableToWithdraw,
    unbondingLots,
    rewardDestination,
    amountActive,
    stakingAccountIsLoading,
    nominations,
    activelyStakedOperators,
  } = stakingAccountInfo;
  const { isMobile } = useWindowWidth();
  const ref = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState<number | null>(null);

  useEffect(() => {
    const container = ref.current;

    const handleResize = () => {
      if (container) {
        setCardWidth(container.clientWidth);
      }
    };

    handleResize(); // Initial calculation

    const resizeObserver = new ResizeObserver(handleResize);

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, []);

  const getKeyName = (key: string) => {
    const keyName = allAccountsWithMeta.find(({ address }) => address === key)
      ?.meta.name;
    return keyName || '';
  };

  const staked = activelyStakedOperators.reduce((total, operator) => {
    return total.plus(operator.value);
  }, new BigNumber(0));

  const noIdentity = cardWidth && (
    <>
      <StyledTopInfo>
        {!isMobile && (
          <IconWrapper $size="48px">
            <Icon name="IdCard" size="32px" className="id-icon" />
          </IconWrapper>
        )}
        <div className="heading-wrapper">
          <Heading type="h4">Your account is incomplete</Heading>
        </div>
      </StyledTopInfo>
      <StyledTextWrapper>
        <Text size="medium">
          Your key must be linked to a Polymesh Account before you can start
          staking. To stake with this key, you can either onboard it through a
          Polymesh Customer Due Diligence Provider to create a new Polymesh
          Account, or assign the key to an existing Polymesh Account.
        </Text>
      </StyledTextWrapper>
      <StyledButtonWrapper $cardWidth={cardWidth}>
        <Button
          onClick={() =>
            window.open(import.meta.env.VITE_ONBOARDING_URL, '_blank')
          }
        >
          Create account
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            window.open(import.meta.env.VITE_ASSIGN_KEY_URL, '_blank')
          }
        >
          Assign key to account
        </Button>
      </StyledButtonWrapper>
    </>
  );

  const goToStakingButton = cardWidth && (
    <StyledButtonWrapper $cardWidth={cardWidth}>
      <Button
        variant="primary"
        onClick={() =>
          window.open(
            `${import.meta.env.VITE_DEVELOPER_APP_URL}#/staking/actions`,
            '_blank',
          )
        }
      >
        Go to Staking
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          window.open(
            `https://community.polymesh.live/hc/en-us/articles/6827378456220-How-to-stake-with-the-Polymesh-App`,
            '_blank',
          )
        }
      >
        Learn how to Stake
      </Button>
    </StyledButtonWrapper>
  );
  const accountDetails = cardWidth && (
    <>
      <StyledTopInfo>
        {!isMobile && (
          <IconWrapper $size="48px">
            <Icon name="StakingIcon" size="32px" className="staking-icon" />
          </IconWrapper>
        )}
        <div className="heading-wrapper">
          <Heading type="h4">Staking Account Details</Heading>
        </div>
      </StyledTopInfo>
      <StyledAccountItemWrapper $cardWidth={cardWidth}>
        <div className="staking-account-item">
          <Label>
            Stash Key
            <Tooltip
              position="top"
              caption="The Stash key is the key that POLYX is bonded to when staking. It can bond tokens and set the Controller key."
              maxWidth={cardWidth < 420 ? 200 : undefined}
            />
          </Label>
          {stashAddress && (
            <Value>
              <StyledNameOrKey>
                {getKeyName(stashAddress) || formatKey(stashAddress)}
              </StyledNameOrKey>
              <CopyToClipboard value={stashAddress} />
            </Value>
          )}
        </div>
        <div className="staking-account-item">
          <Label>
            Controller Key
            <Tooltip
              position={cardWidth < 420 ? 'top' : 'top-left'}
              caption="The Controller key is responsible for actions such as nominating Node Operators, setting the reward destination, initiating unbonding of tokens, rebonding tokens, and withdrawing unbonded tokens to the Stash key."
              maxWidth={cardWidth < 420 ? 200 : undefined}
            />
          </Label>
          {controllerAddress && (
            <Value>
              <StyledNameOrKey>
                {getKeyName(controllerAddress) || formatKey(controllerAddress)}
              </StyledNameOrKey>
              <CopyToClipboard value={controllerAddress} />
            </Value>
          )}
        </div>
        <div className="staking-account-item">
          <Label>
            Reward Destination
            <Tooltip
              position={cardWidth < 600 ? 'top' : 'top-left'}
              caption='The key your staking rewards will be distributed to. "Staked" means the rewards will be bonded to the Stash key. For all other destinations, rewards will not be bonded.'
              maxWidth={cardWidth < 420 ? 200 : undefined}
            />
          </Label>
          <Value>
            {rewardDestination &&
            sdk?.accountManagement.isValidAddress({
              address: rewardDestination,
            }) ? (
              <>
                {getKeyName(rewardDestination) || formatKey(rewardDestination)}
                <CopyToClipboard value={rewardDestination} />
              </>
            ) : (
              rewardDestination
            )}
          </Value>
        </div>
        {totalBonded && (
          <div className="staking-account-item">
            <Label>
              Bonded
              <Tooltip
                position="top"
                caption="The total number of tokens you have bonded, including active, unbonding, and available to withdraw tokens."
                maxWidth={cardWidth < 420 ? 200 : undefined}
              />
            </Label>
            <Value>{formatBalance(totalBonded?.toString())} POLYX</Value>
          </div>
        )}
        {amountActive && (
          <div className="staking-account-item">
            <Label>
              Stakeable
              <Tooltip
                position="top"
                caption="The number of Bonded tokens that can be staked with Node Operators."
                maxWidth={cardWidth < 420 ? 200 : undefined}
              />
            </Label>
            <Value>{formatBalance(amountActive?.toString())} POLYX </Value>
          </div>
        )}
        <div className="staking-account-item">
          <Label>
            <ExpandableOperators
              nominations={activelyStakedOperators}
              label="Staked"
            />
            <Tooltip
              position={cardWidth < 420 ? 'top' : 'top-left'}
              caption="Amount staked in the active staking period and Node Operator allocations. Allocations are determined by the election algorithm based on your nominations."
              maxWidth={cardWidth < 420 ? 200 : undefined}
            />
          </Label>
          <Value>{formatBalance(staked?.toString())} POLYX</Value>
        </div>
        <div className="staking-account-item">
          <Label>
            <ExpandableOperators
              nominations={nominations}
              label="Nominations"
            />
            <Tooltip
              position="top"
              caption="Currently nominated Node Operators. A maximum of 16 operators can be nominated."
              maxWidth={cardWidth < 420 ? 200 : undefined}
            />
          </Label>
          <Value />
        </div>
        {amountUnbonding && (
          <div className="staking-account-item">
            <Label>
              <Unbonding unbondingLots={unbondingLots} />{' '}
              <Tooltip
                position={cardWidth < 420 ? 'top' : 'top-left'}
                caption="Unbonding tokens have not yet completed the waiting period required before they can be withdrawn and transferred freely."
                maxWidth={cardWidth < 420 ? 200 : undefined}
              />{' '}
            </Label>
            <Value> {formatBalance(amountUnbonding.toString())} POLYX</Value>
          </div>
        )}
        {amountAvailableToWithdraw && (
          <div className="staking-account-item">
            <Label>
              Ready to Withdraw
              <Tooltip
                position={cardWidth < 600 ? 'top' : 'top-left'}
                caption="Tokens that have completed their unbonding period and are available to withdraw to the Stash account."
                maxWidth={cardWidth < 420 ? 200 : undefined}
              />
            </Label>
            <Value>
              {formatBalance(amountAvailableToWithdraw?.toString())} POLYX
            </Value>
          </div>
        )}
      </StyledAccountItemWrapper>
      {goToStakingButton}
    </>
  );

  const stakingAccountDetails = () => {
    if (stakingAccountIsLoading) {
      return <SkeletonLoader height="100%" />;
    }
    if (stashAddress) {
      return accountDetails;
    }

    return (
      <>
        <StyledTopInfo>
          {!isMobile && (
            <IconWrapper $size="48px">
              <Icon name="StakingIcon" size="32px" className="staking-icon" />
            </IconWrapper>
          )}
          <div className="heading-wrapper">
            <Heading type="h4">No staking information</Heading>
          </div>
        </StyledTopInfo>
        <StyledTextWrapper>
          <Text size="medium">
            The selected key is not currently staking. Click the button below to
            open the staking interface where you can bond POLYX tokens to a
            stash key, nominate them to node operators and start earning staking
            rewards.
          </Text>
        </StyledTextWrapper>
        {goToStakingButton}
      </>
    );
  };

  return (
    <StyledWrapper ref={ref}>
      {identityLoading && <SkeletonLoader height="100%" />}
      {!identityLoading && (identity ? stakingAccountDetails() : noIdentity)}
    </StyledWrapper>
  );
};
