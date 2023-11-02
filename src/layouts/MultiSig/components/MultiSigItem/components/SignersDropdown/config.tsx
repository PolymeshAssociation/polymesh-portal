import { createColumnHelper } from '@tanstack/react-table';
import { CopyToClipboard } from '~/components';
import { SIGNER_COLUMNS, ISignerItem } from './constants';
import { formatDid } from '~/helpers/formatters';
import {
  StyledAddressWrap,
  StyledLink,
  StyledStatus,
  StyledStatusHeader,
  StyledStatusWrap,
} from './styles';

export const getColumns = (isMobile: boolean) =>
  SIGNER_COLUMNS.map(({ header, accessor }) => {
    const key = accessor as keyof ISignerItem;
    const columnHelper = createColumnHelper<ISignerItem>();
    return columnHelper.accessor(key, {
      header: () => {
        if (key === 'status') {
          return <StyledStatusHeader>{header}</StyledStatusHeader>;
        }
        return header;
      },
      cell: (info) => {
        const data = info.getValue();

        if (key === 'address') {
          return (
            <StyledAddressWrap>
              <StyledLink
                href={`${import.meta.env.VITE_SUBSCAN_URL}account/${data}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {isMobile ? formatDid(data) : data}
              </StyledLink>
              <CopyToClipboard value={data} />
            </StyledAddressWrap>
          );
        }
        if (key === 'status') {
          return (
            <StyledStatusWrap>
              <StyledStatus className={data.toLocaleLowerCase()}>
                {data}
              </StyledStatus>
            </StyledStatusWrap>
          );
        }
        return data;
      },
    });
  });
