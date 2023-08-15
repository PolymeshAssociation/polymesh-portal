import { useContext } from 'react';
import { Text, Heading, Button, SkeletonLoader } from '~/components/UiKit';
import {
  StyledWrapper,
  StyledButtonWrapper,
  IconWrapper,
  StyledTopInfo,
  StyledTextWrapper,
  Label,
  StyledNameOrKey,
} from './styles';
import { formatBalance, formatKey } from '~/helpers/formatters';
import { StakingContext } from '~/context/StakingContext';
import { Icon, CopyToClipboard } from '~/components';
import { useWindowWidth } from '~/hooks/utility';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import Unbonding from './components/Unbonding';
import ExpandableOperators from './components/ExpandableOperators';

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

  const getKeyName = (key: string) => {
    const keyName = allAccountsWithMeta.find(({ address }) => address === key)
      ?.meta.name;
    return keyName || '';
  };

  const noIdentity = (
    <>
      <StyledTopInfo>
        {!isMobile && (
          <IconWrapper size="48px">
            <Icon name="IdCard" size="32px" className="id-icon" />
          </IconWrapper>
        )}
        <div className="heading-wrapper">
          <Heading type="h4">Your account is incomplete</Heading>
        </div>
      </StyledTopInfo>
      <StyledTextWrapper>
        <Text size="large">
          Your key must be linked to a Polymesh Account before you can start
          staking. To stake with this key, you can either onboard it through a
          Polymesh Customer Due Diligence Provider to create a new Polymesh
          Account, or have the key assigned to an existing Polymesh Account.
        </Text>
      </StyledTextWrapper>
      <StyledButtonWrapper>
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

  const goToStakingButton = (
    <StyledButtonWrapper>
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
    </StyledButtonWrapper>
  );

  const accountDetails = (
    <>
      <StyledTopInfo>
        {!isMobile && (
          <IconWrapper size="48px">
            <Icon name="StakingIcon" size="32px" className="staking-icon" />
          </IconWrapper>
        )}
        <div className="heading-wrapper">
          <Heading type="h4">Staking Account Details</Heading>
        </div>
      </StyledTopInfo>
      <div className="staking-account-item">
        <Label>Stash Key</Label>
        {stashAddress && (
          <>
            <StyledNameOrKey>
              {getKeyName(stashAddress) || formatKey(stashAddress)}
            </StyledNameOrKey>
            <CopyToClipboard value={stashAddress} />
          </>
        )}
      </div>
      <div className="staking-account-item">
        <Label>Controller Key</Label>
        {controllerAddress && (
          <>
            <StyledNameOrKey>
              {getKeyName(controllerAddress) || formatKey(controllerAddress)}
            </StyledNameOrKey>
            <CopyToClipboard value={controllerAddress} />
          </>
        )}
      </div>
      <div className="staking-account-item">
        <Label>Reward Destination</Label>
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
      </div>
      {totalBonded && (
        <div className="staking-account-item">
          <Label>Bonded</Label>
          {formatBalance(totalBonded?.toString())} POLYX
        </div>
      )}
      {amountActive && (
        <div className="staking-account-item">
          <Label>Active</Label>
          {formatBalance(amountActive?.toString())} POLYX
        </div>
      )}
      <ExpandableOperators nominations={nominations} label="Nominations" />
      <ExpandableOperators
        nominations={activelyStakedOperators}
        label="Active Era Allocations"
      />
      {amountUnbonding?.gt(0) && (
        <Unbonding
          amountUnbonding={amountUnbonding}
          unbondingLots={unbondingLots}
        />
      )}
      {amountAvailableToWithdraw?.gt(0) && (
        <div className="staking-account-item">
          <Label>Ready to Withdraw</Label>
          {formatBalance(amountAvailableToWithdraw?.toString())} POLYX
        </div>
      )}

      {goToStakingButton}
    </>
  );

  const stakingAccountDetails = () => {
    if (stakingAccountIsLoading) {
      return (
        <SkeletonLoader
          height="100%"
          baseColor="rgba(255,255,255,0.05)"
          highlightColor="rgba(255, 255, 255, 0.24)"
        />
      );
    }
    if (stashAddress) {
      return accountDetails;
    }

    return (
      <>
        <StyledTopInfo>
          {!isMobile && (
            <IconWrapper size="48px">
              <Icon name="StakingIcon" size="32px" className="staking-icon" />
            </IconWrapper>
          )}
          <div className="heading-wrapper">
            <Heading type="h4">No staking account information</Heading>
          </div>
        </StyledTopInfo>
        <StyledTextWrapper>
          <Text size="large">
            The selected key is not currently staking. Click the button below to
            open the staking interface where you can Bond POLYX to a Stash
            Account, Nominated them to Node Operators and start earning staking
            rewards.
          </Text>
        </StyledTextWrapper>
        {goToStakingButton}
      </>
    );
  };

  return (
    <StyledWrapper>
      {identityLoading && (
        <SkeletonLoader
          height="100%"
          baseColor="rgba(255,255,255,0.05)"
          highlightColor="rgba(255, 255, 255, 0.24)"
        />
      )}
      {!identityLoading && (identity ? stakingAccountDetails() : noIdentity)}
    </StyledWrapper>
  );
};
