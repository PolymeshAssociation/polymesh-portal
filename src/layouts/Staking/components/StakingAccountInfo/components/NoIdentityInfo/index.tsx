import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { EExternalIdentityStatus } from '~/context/AccountContext/constants';
import { Icon } from '~/components';
import { Text, Heading, Button } from '~/components/UiKit';
import { formatDid } from '~/helpers/formatters';
import {
  StyledTopInfo,
  StyledTextWrapper,
  IconWrapper,
  StyledButtonWrapper,
  StyledLink,
} from '../../styles';

interface INoIdentityInfoProps {
  cardWidth: number;
  isMobile: boolean;
}

export const NoIdentityInfo: React.FC<INoIdentityInfoProps> = ({
  cardWidth,
  isMobile,
}) => {
  const { selectedAccount, externalIdentity } = useContext(AccountContext);
  const { setIdentityPopup } = useAuthContext();

  return (
    <>
      <StyledTopInfo>
        {!isMobile && (
          <IconWrapper $size="48px">
            <Icon name="IdCard" size="32px" className="id-icon" />
          </IconWrapper>
        )}
        <div className="heading-wrapper">
          <Heading type="h4">
            {externalIdentity?.status === EExternalIdentityStatus.PENDING
              ? 'Existing Applications Found'
              : 'This key is not linked to an account'}
          </Heading>
        </div>
      </StyledTopInfo>
      <StyledTextWrapper>
        {externalIdentity?.status === EExternalIdentityStatus.PENDING ? (
          <>
            <Text size="medium">
              There are already existing CDD applications bound to this address:
            </Text>
            <Text size="medium" truncateOverflow bold>
              {isMobile ? formatDid(selectedAccount) : selectedAccount}
            </Text>
            <Text size="medium" marginTop={10}>
              If you wish you can proceed by creating a new CDD application.
            </Text>
          </>
        ) : (
          <Text size="medium">
            Your key must be linked to a Polymesh Account before you can start
            staking. Complete onboarding to link this key to a new Polymesh
            account. If you have already completed onboarding and want to assign
            this key to an existing account,{' '}
            <StyledLink
              href={import.meta.env.VITE_ASSIGN_KEY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              click here
            </StyledLink>{' '}
            to learn how.
          </Text>
        )}
      </StyledTextWrapper>
      <StyledButtonWrapper $cardWidth={cardWidth}>
        <Button onClick={() => setIdentityPopup('providers')}>
          {externalIdentity?.status === EExternalIdentityStatus.PENDING
            ? 'Create New Application'
            : 'Complete onboarding'}
        </Button>
      </StyledButtonWrapper>
    </>
  );
};
