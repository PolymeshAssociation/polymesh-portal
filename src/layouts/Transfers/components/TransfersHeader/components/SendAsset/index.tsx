/* eslint-disable react/jsx-props-no-spreading */
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  UnsubCallback,
  Venue,
  VenueDetails,
} from '@polymeshassociation/polymesh-sdk/types';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { AssetSelect, Modal } from '~/components';
import { Button, DropdownSelect, Heading } from '~/components/UiKit';
import { InstructionsContext } from '~/context/InstructionsContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { AccountContext } from '~/context/AccountContext';
import { StyledNavLink } from '../../styles';
import { StyledButtonsWrapper, StyledInput, StyledLabel } from '../styles';
import { InputWrapper, StyledNavigation, StyledErrorMessage } from './styles';
import { IFieldValues, FORM_CONFIG } from './components/config';
import { ISelectedAsset } from '~/components/AssetSelect/types';
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';
import { BasicForm } from './components/BasicForm';

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
          className={variant === 'basic' ? 'active' : ''}
          onClick={() => setVariant('basic')}
        >
          Basic
        </StyledNavLink>
        <StyledNavLink
          className={variant === 'advanced' ? 'active' : ''}
          onClick={() => setVariant('advanced')}
        >
          Advanced
        </StyledNavLink>
      </StyledNavigation>
      {variant === 'basic' ? <BasicForm toggleModal={toggleModal} /> : null}
    </Modal>
  );
};
