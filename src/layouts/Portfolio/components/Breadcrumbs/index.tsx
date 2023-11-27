import { useSearchParams } from 'react-router-dom';
import { StyledBreadcrumbsContainer, StyledBreadcrumb } from './styles';

export const Breadcrumbs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('id');
  const nftCollection = searchParams.get('nftCollection') || '';
  const nftId = searchParams.get('nftId');
  const asset = searchParams.get('asset');

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
      {nftCollection && (
        <StyledBreadcrumb
          onClick={() =>
            nftId
              ? setSearchParams(id ? { id, nftCollection } : { nftCollection })
              : null
          }
        >
          {nftCollection}
        </StyledBreadcrumb>
      )}
      {asset && <StyledBreadcrumb>{asset}</StyledBreadcrumb>}
      {nftId && <StyledBreadcrumb>#{nftId}</StyledBreadcrumb>}
    </StyledBreadcrumbsContainer>
  );
};
