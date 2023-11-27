import { Icon } from '~/components';
import { ECollectionView } from '../../constants';
import { StyledSwitcherWrapper, StyledIconWrapper } from './styles';

interface IViewSwitcherProps {
  view: ECollectionView;
  setView: (view: ECollectionView) => void;
}

export const ViewSwitcher: React.FC<IViewSwitcherProps> = ({
  view,
  setView,
}) => (
  <StyledSwitcherWrapper>
    <StyledIconWrapper
      $isActive={view === ECollectionView.TABLE}
      onClick={() => setView(ECollectionView.TABLE)}
    >
      <Icon name="TableView" size="24px" />
    </StyledIconWrapper>
    <StyledIconWrapper
      $isActive={view === ECollectionView.PALLETE}
      onClick={() => setView(ECollectionView.PALLETE)}
    >
      <Icon name="PalleteView" size="24px" className="icon" />
    </StyledIconWrapper>
  </StyledSwitcherWrapper>
);
