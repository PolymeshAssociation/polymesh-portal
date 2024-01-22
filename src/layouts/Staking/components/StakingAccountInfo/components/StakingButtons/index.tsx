import { useContext } from 'react';
import { StakingContext } from '~/context/StakingContext';
import { Icon } from '~/components';
import { Button } from '~/components/UiKit';
import { EModalOptions } from '../../constants';

interface IStakingButtonsProps {
  disabled: boolean;
  toggleOptions: () => void;
  toggleModal: (modal: EModalOptions) => void;
}

export const StakingButtons: React.FC<IStakingButtonsProps> = ({
  disabled,
  toggleOptions,
  toggleModal,
}) => {
  const {
    eraStatus: { electionInProgress },
    stakingAccountInfo: { stashAddress, isController, isStash },
  } = useContext(StakingContext);
  const isElectionInProgress = electionInProgress === 'Open';

  const handleAction = () => {
    if (disabled || isElectionInProgress) {
      return;
    }
    let modalOption;

    if (!stashAddress) {
      modalOption = EModalOptions.STAKE;
    } else if (isStash) {
      modalOption = EModalOptions.BOND_MORE;
    } else if (!isStash && isController) {
      modalOption = EModalOptions.CHANGE_NOMINATIONS;
    } else return;

    toggleModal(modalOption);
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={handleAction}
        disabled={disabled || isElectionInProgress}
      >
        {!stashAddress && EModalOptions.STAKE}
        {isStash && EModalOptions.BOND_MORE}
        {!isStash && isController && EModalOptions.CHANGE_NOMINATIONS}
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          window.open(
            'https://community.polymesh.live/hc/en-us/articles/12131464556060-How-to-stake-on-the-Polymesh-Portal',
            '_blank',
          )
        }
      >
        Learn how to Stake
      </Button>
      {stashAddress && (
        <Button variant="secondary" onClick={toggleOptions}>
          <Icon name="VerticalDotsIcon" />
        </Button>
      )}
    </>
  );
};
