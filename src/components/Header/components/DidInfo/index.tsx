import { useContext } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';
import { StyledWrapper, StyledLabel } from './styles';
import { Icon, CopyToClipboard } from '~/components';
import { SkeletonLoader, Text } from '~/components/UiKit';
import { formatDid } from '~/helpers/formatters';

export const DidInfo = () => {
  const {
    state: { connecting },
  } = useContext(PolymeshContext);
  const { identity, identityLoading, keyCddVerificationInfo } =
    useContext(AccountContext);

  return (
    <StyledWrapper>
      <div className="icon-wrapper">
        <Icon name="IdCard" className="id-icon" size="16px" />
      </div>
      {connecting || identityLoading ? (
        <>
          <SkeletonLoader width="64px" />
          <SkeletonLoader circle width="24px" />
        </>
      ) : (
        <>
          {!!identity && (
            <>
              <Text size="small" bold color="secondary">
                {formatDid(identity.did)}
              </Text>
              <CopyToClipboard value={identity.did} />
            </>
          )}
          {!identity && (
            <StyledLabel>
              {keyCddVerificationInfo?.status || 'Unassigned'}
            </StyledLabel>
          )}
        </>
      )}
    </StyledWrapper>
  );
};
