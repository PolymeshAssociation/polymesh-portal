/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { PortfolioContext } from '~/context/PortfolioContext';
import type { AssetSnapshotProps } from '../../types';
import { ModalContainer, ModalContent, ModalActions } from '../../styles';
import {
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldWrapper,
  StyledErrorMessage,
} from '../../../CreateAssetWizard/styles';

interface IssueTokensModalProps {
  assetDetails: AssetSnapshotProps['asset'];
  isOpen: boolean;
  onClose: () => void;
  issueTokens: (params: {
    amount: BigNumber;
    portfolioId?: BigNumber;
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

interface IssueTokensFormData {
  amount: number;
  portfolioId: number | 'default';
}

// Validation schema using asset divisibility
const getValidationSchema = (isDivisible: boolean) =>
  yup.object().shape({
    amount: yup
      .number()
      .transform((value, originalValue) =>
        typeof originalValue === 'string' && originalValue.trim() === ''
          ? undefined
          : Number(value),
      )
      .typeError('Amount must be a number')
      .min(0.000001, 'Amount must be greater than 0')
      .required('Amount is required')
      .test(
        'is-decimal',
        `${isDivisible ? 'Maximum 6 decimal places' : 'Amount must be a whole number'}`,
        function checkDecimals(value) {
          if (value == null) return true;
          const valueStr = value.toString();
          if (isDivisible) {
            return /^-?\d+(\.\d{1,6})?$/.test(valueStr);
          }
          return /^-?\d+$/.test(valueStr);
        },
      ),
    portfolioId: yup.mixed().required('Portfolio is required'),
  });

export const IssueTokensModal: React.FC<IssueTokensModalProps> = ({
  assetDetails,
  isOpen,
  onClose,
  issueTokens,
  transactionInProcess,
}) => {
  const { allPortfolios } = useContext(PortfolioContext);

  const isDivisible = assetDetails.details?.isDivisible || false;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IssueTokensFormData>({
    mode: 'onChange',
    defaultValues: {
      amount: undefined,
      portfolioId: 'default',
    },
    resolver: yupResolver(getValidationSchema(isDivisible)),
  });

  const onSubmit = async (formData: IssueTokensFormData) => {
    issueTokens({
      amount: new BigNumber(formData.amount),
      portfolioId:
        formData.portfolioId === 'default'
          ? undefined
          : new BigNumber(formData.portfolioId),
      onTransactionRunning: () => {
        reset();
        onClose();
      },
    });
  };

  const handleClose = () => {
    if (!transactionInProcess) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="600px">
      <ModalContainer>
        <Heading type="h4">Issue Tokens</Heading>

        <ModalContent>
          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Amount to Issue</FieldLabel>
              <FieldInput
                type="text"
                placeholder="Enter token amount"
                $hasError={!!errors.amount}
                disabled={transactionInProcess}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const input = e.currentTarget;
                  input.value = input.value.replace(/[^\d.]/g, '');
                }}
                {...register('amount')}
              />
            </FieldRow>
            {errors.amount && (
              <StyledErrorMessage>
                {errors.amount.message as string}
              </StyledErrorMessage>
            )}
          </FieldWrapper>

          <FieldWrapper>
            <FieldRow>
              <FieldLabel>Destination Portfolio</FieldLabel>
              <FieldSelect
                disabled={transactionInProcess}
                {...register('portfolioId' as const)}
              >
                <option value="default">Default Portfolio</option>
                {allPortfolios
                  .filter((p) => p.id !== 'default')
                  .map((p) => (
                    <option key={p.id?.toString()} value={p.id?.toString()}>
                      {p.id} - {p.name}
                    </option>
                  ))}
              </FieldSelect>
            </FieldRow>
            {errors.portfolioId && (
              <StyledErrorMessage>
                {errors.portfolioId.message as string}
              </StyledErrorMessage>
            )}
          </FieldWrapper>

          <ModalActions>
            <Button
              variant="modalSecondary"
              onClick={handleClose}
              disabled={transactionInProcess}
            >
              Cancel
            </Button>
            <Button
              variant="modalPrimary"
              onClick={handleSubmit(onSubmit)}
              disabled={Object.keys(errors).length > 0 || transactionInProcess}
            >
              Issue Tokens
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
