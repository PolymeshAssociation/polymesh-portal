import { FC } from 'react';
import { SkeletonLoader } from '~/components/UiKit';
import { StyledCard } from '../MultiSigItem/components/MultiSigListItem/styles';
import {
  StyledInfo,
  StyledInfoItem,
} from '../MultiSigItem/components/DetailsData/styles';
import {
  StyledInfoBlock,
  StyledEmptyText,
  StyledButtonsWrapper,
} from './styles';

interface IItemPlaceHolderProps {
  isLoading: boolean;
  isEmpty: boolean;
}

const sceletonInfo = [1, 2, 3, 4, 5, 6];
const sceletonButtons = [1, 2, 3];

export const ItemPlaceHolder: FC<IItemPlaceHolderProps> = ({
  isLoading,
  isEmpty,
}) => (
  <StyledCard>
    {isLoading && (
      <>
        <StyledInfo>
          {sceletonInfo.map((key) => (
            <StyledInfoBlock key={key} className={key === 6 ? 'right' : ''}>
              <SkeletonLoader width={80} height="24px" />
              <StyledInfoItem>
                <SkeletonLoader width={120} height="24px" />
              </StyledInfoItem>
            </StyledInfoBlock>
          ))}
        </StyledInfo>
        <StyledButtonsWrapper>
          {sceletonButtons.map((key) => (
            <SkeletonLoader height="48px" key={key} />
          ))}
        </StyledButtonsWrapper>
      </>
    )}
    {!isLoading && isEmpty && (
      <StyledEmptyText>No pending proposals available</StyledEmptyText>
    )}
  </StyledCard>
);
