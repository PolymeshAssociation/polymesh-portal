import { useState, useContext, useEffect } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import { SkeletonLoader } from '~/components/UiKit';
import { StyledDurationContainer, StyledDuration } from './styles';

interface IDurationInfoProps {
  label: string;
}

export const DurationInfo: React.FC<IDurationInfoProps> = ({ label }) => {
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
      {label}:
      {duration ? (
        <StyledDuration>{duration} days</StyledDuration>
      ) : (
        <SkeletonLoader width={100} />
      )}
    </StyledDurationContainer>
  );
};
