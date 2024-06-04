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
    externalConnection,
  } = useContext(PolymeshContext);
  const { identity, identityLoading, externalIdentity } =
    useContext(AccountContext);
  const identityPending =
    externalConnection && !!externalIdentity?.applications?.length;
  const did = externalConnection
    ? externalIdentity?.identity?.did
    : identity?.did;

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
          {!!did && (
            <>
              <Text size="small" bold color="secondary">
                {formatDid(did)}
              </Text>
              <CopyToClipboard value={did} />
            </>
          )}
          {identityPending && <StyledLabel>Pending Verification</StyledLabel>}
          {!identityPending && !identityLoading && !did && (
            <StyledLabel>Unassigned</StyledLabel>
          )}
        </>
      )}
    </StyledWrapper>
  );
};
