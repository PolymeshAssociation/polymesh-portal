import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { usePortfolio } from '~/hooks/polymesh';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import {
  StyledInput,
  StyledButtonWrapper,
  StyledError,
  StyledLink,
} from './styles';
import { EModalType, modalConfig, createFormConfig } from './constants';
import { useWindowWidth } from '~/hooks/utility';
import { DescriptionText } from '~/layouts/AssetManager/components/CreateAssetWizard/styles';

interface IPortfolioModalProps {
  type: `${EModalType}`;
  portfolio?: IPortfolioData;
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}

export const PortfolioModal: React.FC<IPortfolioModalProps> = ({
  type,
  toggleModal,
  portfolio,
}) => {
  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useForm(
    createFormConfig(
      type === EModalType.EDIT ? (portfolio as IPortfolioData).name : '',
    ),
  );
  const { createPortfolio, editPortfolio, isTransactionInProgress } =
    usePortfolio(portfolio?.portfolio);
  const { isMobile } = useWindowWidth();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const newName = data.name as string;

    toggleModal();

    switch (type) {
      case EModalType.ADD:
        await createPortfolio(newName);
        break;

      case EModalType.EDIT:
        await editPortfolio(newName);
        break;

      default:
        break;
    }
  };

  return (
    <Modal handleClose={toggleModal}>
      <Heading type="h4" marginBottom={32}>
        {modalConfig[type].title}
      </Heading>
      {modalConfig[type].description && (
        <DescriptionText>
          {modalConfig[type].description}
          {modalConfig[type].link && (
            <>
              {' '}
              For more details, see the{' '}
              <StyledLink
                href={modalConfig[type].link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Portfolio documentation
              </StyledLink>
            </>
          )}
        </DescriptionText>
      )}
      <StyledInput
        placeholder={modalConfig[type].placeholder}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...register('name')}
      />
      {errors.name?.message ? (
        <StyledError>{errors.name.message as string}</StyledError>
      ) : null}
      <StyledButtonWrapper>
        {!isMobile && (
          <Button variant="modalSecondary" onClick={toggleModal}>
            Cancel
          </Button>
        )}
        <Button
          variant="modalPrimary"
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isTransactionInProgress}
        >
          Confirm
        </Button>
      </StyledButtonWrapper>
    </Modal>
  );
};
