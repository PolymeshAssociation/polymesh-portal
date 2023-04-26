import { useSearchParams } from 'react-router-dom';
import { EClaimsType } from '../../constants';
import { Button } from '~/components/UiKit';
import { Icon } from '~/components';
import { StyledNavBar, StyledNavLink, StyledNavList } from './styles';

export const ClaimsNavigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const claimType = searchParams.get('type');
  return (
    <StyledNavBar>
      <StyledNavList>
        {Object.values(EClaimsType).map((type) => (
          <StyledNavLink
            key={type}
            className={type === claimType ? 'active' : ''}
            onClick={() => setSearchParams({ type })}
          >
            {type}
          </StyledNavLink>
        ))}
      </StyledNavList>
      <Button variant="modalPrimary">
        <Icon name="Plus" />
        Create New Claim
      </Button>
    </StyledNavBar>
  );
};
