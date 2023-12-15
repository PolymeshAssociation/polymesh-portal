import Tooltip from '~/components/UiKit/Tooltip';
import { Icon } from '~/components';
import { ICollectionMeta } from '../../constants';
import {
  StyledInfoBlockItem,
  StyledInfoBlockDescription,
} from '../../../NftAsset/styles';
import {
  StyledTooltipWrapper,
  StyledTooltipsContainer,
  StyledBlockHeaderCapitalized,
} from '../../styles';

interface ICollectionMetaProps {
  meta: ICollectionMeta;
}

export const CollectionMeta: React.FC<ICollectionMetaProps> = ({ meta }) => {
  return (
    <StyledInfoBlockItem>
      <StyledTooltipWrapper>
        <StyledBlockHeaderCapitalized>{meta.name}</StyledBlockHeaderCapitalized>
        <StyledTooltipsContainer>
          {meta.description && (
            <Tooltip caption={meta.description} position="top-right" />
          )}
          {meta.isLocked && (
            <Tooltip
              position="top-right"
              caption={`${meta.isLocked} | ${
                meta.expiry ? meta.expiry : 'Forever'
              }`}
            >
              <Icon name="LockIcon" size="14px" />
            </Tooltip>
          )}
        </StyledTooltipsContainer>
      </StyledTooltipWrapper>
      <StyledInfoBlockDescription>
        {meta.value ? meta.value : '-'}
      </StyledInfoBlockDescription>
    </StyledInfoBlockItem>
  );
};
