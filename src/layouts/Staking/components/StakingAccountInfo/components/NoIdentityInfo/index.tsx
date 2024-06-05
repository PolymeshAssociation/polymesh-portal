import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { useAuthContext } from '~/context/AuthContext';
import { EKeyIdentityStatus } from '~/context/AccountContext/constants';
import { Icon } from '~/components';
import { Text, Heading, Button } from '~/components/UiKit';
import {
  StyledTopInfo,
  StyledTextWrapper,
  IconWrapper,
  StyledButtonWrapper,
  StyledLink,
} from '../../styles';
import { PolymeshContext } from '~/context/PolymeshContext';

interface INoIdentityInfoProps {
  cardWidth: number;
  isMobile: boolean;
}

export const NoIdentityInfo: React.FC<INoIdentityInfoProps> = ({
  cardWidth,
  isMobile,
}) => {
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);
  const { keyCddVerificationInfo } = useContext(AccountContext);
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
          <Heading type="h4">This key is not linked to an identity</Heading>
        </div>
      </StyledTopInfo>
      <StyledTextWrapper>
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
      </StyledTextWrapper>
      <StyledButtonWrapper $cardWidth={cardWidth}>
        <Button
          disabled={
            polkadotApi?.genesisHash.toString() !==
            import.meta.env.VITE_GENESIS_HASH
          }
          onClick={() =>
            setIdentityPopup({
              type:
                keyCddVerificationInfo?.status === EKeyIdentityStatus.PENDING
                  ? 'pending'
                  : 'providers',
            })
          }
        >
          Complete onboarding
        </Button>
      </StyledButtonWrapper>
    </>
  );
};
