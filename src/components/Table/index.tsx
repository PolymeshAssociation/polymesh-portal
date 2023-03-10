import { Table as ReactTable, flexRender } from '@tanstack/react-table';
import { Pagination } from '~/components';
import { Heading } from '../UiKit';
import {
  StyledTableWrapper,
  StyledTableHeader,
  StyledTableBody,
  StyledTableFooter,
  StyledTablePlaceholder,
} from './styles';

interface ITableProps {
  table: ReactTable;
  title: string;
  loading: boolean;
}

const Table: React.FC<ITableProps> = ({ table, title, loading }) => {
  const colsNumber = table.getAllColumns().length;
  const rowsNumber = table.getExpandedRowModel().rows.length as number;

  const getCurrentPageItems = () => {
    const {
      pagination: { pageIndex, pageSize },
    } = table.getState();
    const { rows } = table.getPaginationRowModel();
    const first = pageIndex * pageSize + 1;
    const last = (first - 1 + rows.length) as number;

    return { first, last };
  };

  return (
    <StyledTableWrapper>
      <StyledTableHeader>
        <Heading type="h3">{title}</Heading>
      </StyledTableHeader>
      {loading ? (
        <StyledTablePlaceholder>Loading...</StyledTablePlaceholder>
      ) : (
        <StyledTableBody colsNumber={colsNumber}>
          <thead>
            <tr>
              {table.getFlatHeaders().map((header) => (
                <td key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell(cell),
                        // ||  cell.getContext().getValue(),
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </StyledTableBody>
      )}
      <StyledTableFooter>
        {!loading && rowsNumber ? (
          <Pagination
            totalItems={rowsNumber}
            currentItems={getCurrentPageItems()}
            isPrevDisabled={!table.getCanPreviousPage()}
            isNextDisabled={!table.getCanNextPage()}
            onNextPageClick={() => table.nextPage()}
            onPrevPageClick={() => table.previousPage()}
          />
        ) : null}
      </StyledTableFooter>
    </StyledTableWrapper>
  );
};

export default Table;
