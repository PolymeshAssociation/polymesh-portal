/* eslint-disable react/jsx-props-no-spreading */
import { yupResolver } from '@hookform/resolvers/yup';
import { TrustedFor } from '@polymeshassociation/polymesh-sdk/types';
import { useCallback, useContext } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useCustomClaims } from '~/hooks/polymesh/useCustomClaims';
import { TrustedClaimIssuerFields } from '../../../CreateAssetWizard/components/TrustedClaimIssuerFields';
import { DescriptionText, StyledLink } from '../../../CreateAssetWizard/styles';
import { ModalActions, ModalContainer, ModalContent } from '../../styles';

interface AddTrustedClaimIssuerForm {
  identity: string;
  trustedFor: TrustedFor[] | null;
}

interface AddTrustedClaimIssuerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClaimIssuer: (params: {
    claimIssuers: Array<{
      identity: string;
      trustedFor: TrustedFor[] | null;
    }>;
    onTransactionRunning?: () => void | Promise<void>;
  }) => Promise<void>;
  transactionInProcess: boolean;
}

export const AddTrustedClaimIssuerModal: React.FC<
  AddTrustedClaimIssuerModalProps
> = ({ isOpen, onClose, onAddClaimIssuer, transactionInProcess }) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const customClaimsHook = useCustomClaims();

  const validationSchema = yup.object().shape({
    identity: yup
      .string()
      .required('Issuer DID is required')
      .matches(/^0x[0-9a-fA-F]{64}$/, 'Issuer DID must be valid')
      .test(
        'is-valid-identity',
        'Issuer DID does not exist',
        async function validateDid(value) {
          if (!value || !value.match(/^0x[0-9a-fA-F]{64}$/)) return true;
          if (!sdk) return false;
          try {
            return await sdk.identities.isIdentityValid({
              identity: value,
            });
          } catch (error) {
            return false;
          }
        },
      ),
    trustedFor: yup
      .array()
      .nullable()
      .test('has-claims', 'At least one claim type is required', (value) => {
        if (value === null) return true;
        return Array.isArray(value) && value.length > 0;
      }),
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddTrustedClaimIssuerForm>({
    defaultValues: {
      identity: '',
      trustedFor: null,
    },
    resolver: yupResolver(validationSchema),
  });

  const identityValue = watch('identity');
  const trustedForValue = watch('trustedFor');

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (data: AddTrustedClaimIssuerForm) => {
      await onAddClaimIssuer({
        claimIssuers: [
          {
            identity: data.identity,
            trustedFor: data.trustedFor,
          },
        ],
        onTransactionRunning: handleClose,
      });
    },
    [onAddClaimIssuer, handleClose],
  );

  if (!isOpen) return null;

  return (
    <Modal handleClose={handleClose} customWidth="700px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h4" marginBottom={24}>
            Add Trusted Claim Issuer
          </Heading>
          <DescriptionText>
            Designate a trusted entity to issue claims to identities for your
            asset's compliance rules. Only claims from trusted issuers are
            considered valid when evaluating compliance requirements such as
            KYC, accreditation status, and jurisdiction. Learn more at{' '}
            <StyledLink
              href="https://developers.polymesh.network/compliance/#trusted-claim-issuers"
              target="_blank"
              rel="noopener noreferrer"
            >
              Trusted Claim Issuers Documentation
            </StyledLink>
          </DescriptionText>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TrustedClaimIssuerFields
              identityValue={identityValue}
              identityError={errors.identity?.message}
              onIdentityChange={(value) =>
                setValue('identity', value, { shouldValidate: true })
              }
              trustedForValue={trustedForValue}
              trustedForError={errors.trustedFor?.message}
              onTrustedForChange={(value) =>
                setValue('trustedFor', value, { shouldValidate: true })
              }
              customClaimsHook={customClaimsHook}
            />
          </form>

          <ModalActions>
            <Button
              variant="modalSecondary"
              onClick={handleClose}
              disabled={transactionInProcess}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="modalPrimary"
              disabled={transactionInProcess || !!Object.keys(errors).length}
            >
              {transactionInProcess
                ? 'Processing...'
                : 'Add Trusted Claim Issuer'}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};
