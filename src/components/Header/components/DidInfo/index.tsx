import { useContext } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useAccountIdentity } from '~/hooks/polymesh';
import { StyledWrapper } from './styles';
import { Icon, CopyToClipboard } from '~/components';
import { Text } from '~/components/UiKit';
import { formatDid } from '~/helpers/formatters';

export const DidInfo = () => {
  const {
    state: { connecting },
  } = useContext(PolymeshContext);
  const { identity, identityLoading } = useAccountIdentity();

  return (
    <StyledWrapper>
      <Icon name="IdCard" className="id-icon" size="16px" />
      {connecting || identityLoading ? (
        '...'
      ) : (
        <Text size="small" bold color="secondary">
          {formatDid(identity?.did)}
        </Text>
      )}
      <CopyToClipboard value={identity?.did} />
    </StyledWrapper>
  );
};
