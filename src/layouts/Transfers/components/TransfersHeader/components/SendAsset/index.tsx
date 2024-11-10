import { useState } from 'react';
import clsx from 'clsx';
import { Modal } from '~/components';
import { Heading } from '~/components/UiKit';
import { StyledNavLink } from '../../styles';
import { StyledNavigation } from './styles';
import { BasicForm } from './components/BasicForm';
import { AdvancedForm } from './components/AdvancedForm';

interface ISendAssetProps {
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}

export const SendAsset: React.FC<ISendAssetProps> = ({ toggleModal }) => {
  const [variant, setVariant] = useState('basic');

  return (
    <Modal handleClose={toggleModal}>
      <Heading type="h4" marginBottom={40}>
        Send Asset
      </Heading>
      <StyledNavigation>
        <StyledNavLink
          className={clsx({ active: variant === 'basic' })}
          onClick={() => setVariant('basic')}
        >
          Basic
        </StyledNavLink>
        <StyledNavLink
          className={clsx({ active: variant === 'advanced' })}
          onClick={() => setVariant('advanced')}
        >
          Advanced
        </StyledNavLink>
      </StyledNavigation>
      {variant === 'basic' ? (
        <BasicForm toggleModal={toggleModal} />
      ) : (
        <AdvancedForm toggleModal={toggleModal} />
      )}
    </Modal>
  );
};
