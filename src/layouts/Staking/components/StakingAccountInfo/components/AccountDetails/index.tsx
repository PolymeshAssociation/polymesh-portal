import { useContext } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { StakingContext } from '~/context/StakingContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';
import { formatBalance, formatKey } from '~/helpers/formatters';
import { Icon, CopyToClipboard } from '~/components';
import { Heading } from '~/components/UiKit';
import Tooltip from '~/components/UiKit/Tooltip';
import ExpandableOperators from '../ExpandableOperators';
import Unbonding from '../Unbonding';
import { StyledTopInfo, IconWrapper } from '../../styles';
import {
  StyledAccountItemWrapper,
  StyledNameOrKey,
  Label,
  Value,
} from './styles';

interface IAccountDetailsProps {
  cardWidth: number;
}

export const AccountDetails: React.FC<IAccountDetailsProps> = ({
  cardWidth,
}) => {
  const { allAccountsWithMeta } = useContext(AccountContext);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const { stakingAccountInfo } = useContext(StakingContext);
  const {
    stashAddress,
    controllerAddress,
    totalBonded,
    amountUnbonding,
    amountAvailableToWithdraw,
    unbondingLots,
    rewardDestination,
    amountActive,
    nominations,
    activelyStakedOperators,
  } = stakingAccountInfo;

  const getKeyName = (key: string) => {
    const keyName = allAccountsWithMeta.find(({ address }) => address === key)
      ?.meta.name;
    return keyName || '';
  };

  const staked = activelyStakedOperators.reduce((total, operator) => {
    return total.plus(operator.value);
  }, new BigNumber(0));

  return (
    <>
      <StyledTopInfo>
        <IconWrapper $size="48px">
          <Icon name="StakingIcon" size="32px" className="staking-icon" />
        </IconWrapper>
        <div className="heading-wrapper">
          <Heading type="h4">Staking Account Details</Heading>
        </div>
      </StyledTopInfo>
      <StyledAccountItemWrapper $cardWidth={cardWidth}>
        <div className="staking-account-item">
          {stashAddress && (
            <Value>
              <StyledNameOrKey>
                {getKeyName(stashAddress) || formatKey(stashAddress)}
              </StyledNameOrKey>
              <CopyToClipboard value={stashAddress} />
            </Value>
          )}
          <Label>
            Stash Key
            <Tooltip
              position="top"
              caption="The Stash key is the key that POLYX is bonded to when staking. It can bond tokens and set the Controller key."
              maxWidth={cardWidth < 420 ? 200 : undefined}
            />
          </Label>
        </div>
        <div className="staking-account-item">
          {controllerAddress && (
            <Value>
              <StyledNameOrKey>
                {getKeyName(controllerAddress) || formatKey(controllerAddress)}
              </StyledNameOrKey>
              <CopyToClipboard value={controllerAddress} />
            </Value>
          )}
          <Label>
            Controller Key
            <Tooltip
              position={cardWidth < 420 ? 'top' : 'top-left'}
              caption="The Controller key is responsible for actions such as nominating Node Operators, setting the reward destination, initiating unbonding of tokens, rebonding tokens, and withdrawing unbonded tokens to the Stash key."
              maxWidth={cardWidth < 420 ? 200 : undefined}
            />
          </Label>
        </div>
        <div className="staking-account-item">
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
              // TODO: create stashshes with different reward destination to check
              rewardDestination
            )}
          </Value>
          <Label>
            Reward Destination
            <Tooltip
              position={cardWidth < 600 ? 'top' : 'top-left'}
              caption='The key your staking rewards will be distributed to. "Staked" means the rewards will be bonded to the Stash key. For all other destinations, rewards will not be bonded.'
              maxWidth={cardWidth < 420 ? 200 : undefined}
            />
          </Label>
        </div>
        {totalBonded && (
          <div className="staking-account-item">
            <Value>
              {formatBalance(totalBonded?.toString())}{' '}
              <span className="grayed">POLYX</span>
            </Value>
            <Label>
              Bonded
              <Tooltip
                position="top"
                caption="The total number of tokens you have bonded, including active, unbonding, and available to withdraw tokens."
                maxWidth={cardWidth < 500 ? 200 : undefined}
              />
            </Label>
          </div>
        )}
        {amountActive && (
          <div className="staking-account-item">
            <Value>
              {formatBalance(amountActive?.toString())}{' '}
              <span className="grayed">POLYX</span>{' '}
            </Value>
            <Label>
              Stakeable
              <Tooltip
                position="top"
                caption="The number of Bonded tokens that can be staked with Node Operators."
                maxWidth={cardWidth < 420 ? 200 : undefined}
              />
            </Label>
          </div>
        )}
        <div className="staking-account-item">
          <Value>
            {formatBalance(staked?.toString())}{' '}
            <span className="grayed">POLYX</span>
          </Value>
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
        </div>
        <div className="staking-account-item">
          <Value>&mdash;</Value>
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
        </div>
        {amountUnbonding && (
          <div className="staking-account-item">
            <Value> {formatBalance(amountUnbonding.toString())} POLYX</Value>
            <Label>
              <Unbonding unbondingLots={unbondingLots} />{' '}
              <Tooltip
                position={cardWidth < 420 ? 'top' : 'top-left'}
                caption="Unbonding tokens have not yet completed the waiting period required before they can be withdrawn and transferred freely."
                maxWidth={cardWidth < 420 ? 200 : undefined}
              />{' '}
            </Label>
          </div>
        )}
        {amountAvailableToWithdraw && (
          <div className="staking-account-item">
            <Value>
              {formatBalance(amountAvailableToWithdraw?.toString())} POLYX
            </Value>
            <Label>
              Ready to Withdraw
              <Tooltip
                position={cardWidth < 600 ? 'top' : 'top-left'}
                caption="Tokens that have completed their unbonding period and are available to withdraw to the Stash account."
                maxWidth={cardWidth < 420 ? 200 : undefined}
              />
            </Label>
          </div>
        )}
      </StyledAccountItemWrapper>
    </>
  );
};
