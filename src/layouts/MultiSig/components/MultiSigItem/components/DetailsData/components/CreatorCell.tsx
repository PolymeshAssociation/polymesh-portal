import { CopyToClipboard } from '~/components';
import { formatDid } from '~/helpers/formatters';
import { StyledInfoItem, StyledCopyWrap } from '../styles';

export const CreatorCell = ({ creator }: { creator: string }) => (
  <StyledCopyWrap>
    <StyledInfoItem>{formatDid(creator)}</StyledInfoItem>
    <CopyToClipboard value={creator} />
  </StyledCopyWrap>
);
