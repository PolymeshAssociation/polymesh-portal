import { useSearchParams } from 'react-router-dom';
import { StyledBreadcrumbsContainer, StyledBreadcrumb } from './styles';

export const Breadcrumbs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('id');
  const nftCollection = searchParams.get('nftCollection') || '';
  const nftId = searchParams.get('nftId');

  return (
    <StyledBreadcrumbsContainer>
      <StyledBreadcrumb onClick={() => setSearchParams()}>
        Portfolio
      </StyledBreadcrumb>
      {id && (
        <StyledBreadcrumb onClick={() => setSearchParams({ id })}>
          {id}
        </StyledBreadcrumb>
      )}
      <StyledBreadcrumb
        onClick={() =>
          nftId
            ? setSearchParams(id ? { id, nftCollection } : { nftCollection })
            : null
        }
      >
        {nftCollection}
      </StyledBreadcrumb>
      {nftId && <StyledBreadcrumb>#{nftId}</StyledBreadcrumb>}
    </StyledBreadcrumbsContainer>
  );
};
