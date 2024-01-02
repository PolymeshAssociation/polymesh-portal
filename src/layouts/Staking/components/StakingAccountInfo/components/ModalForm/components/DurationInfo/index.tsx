import { useState, useContext, useEffect } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import { SkeletonLoader } from '~/components/UiKit';
import { StyledDurationContainer, StyledDuration, StyledLabel } from './styles';
import Tooltip from '~/components/UiKit/Tooltip';

interface IDurationInfoProps {
  label: string;
  tooltip?: boolean;
}

export const DurationInfo: React.FC<IDurationInfoProps> = ({
  label,
  tooltip,
}) => {
  const [duration, setDuration] = useState<number>();

  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);

  useEffect(() => {
    if (!polkadotApi) return;

    (async () => {
      try {
        const currentDuration =
          await polkadotApi.consts.staking.bondingDuration.toNumber();
        setDuration(currentDuration);
      } catch (error) {
        notifyError((error as Error).message);
      }
    })();
  }, [polkadotApi]);

  return (
    <StyledDurationContainer>
      <StyledLabel>
        {label}:{' '}
        {tooltip && (
          <Tooltip
            caption='Before staked tokens can be transferred, both the "Unbond POLYX" and "Withdraw Unbonded" transactions must be submitted. Withdrawal is only available after the unbond transaction has been submitted, and the unbonding period has elapsed.'
            position="top"
          />
        )}
      </StyledLabel>
      {duration ? (
        <StyledDuration>{duration} days</StyledDuration>
      ) : (
        <SkeletonLoader width={100} />
      )}
    </StyledDurationContainer>
  );
};
