import { Table as ReactTable, flexRender } from '@tanstack/react-table';
import { Dispatch, SetStateAction } from 'react';
import { Icon, Pagination } from '~/components';
import { useWindowWidth } from '~/hooks/utility';
import { Button, Heading } from '../UiKit';
import {
  StyledTableWrapper,
  StyledTableHeader,
  StyledTableBody,
  StyledTableFooter,
  StyledTablePlaceholder,
  StyledTabsWrapper,
  StyledTabItem,
  StyledPerPageWrapper,
  StyledPerPageSelect,
  StyledMobileTable,
  StyledMobileRow,
  StyledMobileCell,
} from './styles';

interface ITableProps<T, S> {
  data: {
    tab?: string;
    table: ReactTable<T>;
  };
  title: string;
  tabs?: string[];
  setTab?: Dispatch<SetStateAction<S>>;
  loading: boolean;
  totalItems?: number;
}

const perPageOptions = [3, 5, 10, 20, 50];

const Table = <T, S>(props: ITableProps<T, S>) => {
  const { isMobile, isTablet } = useWindowWidth();

  const {
    data: { table, tab },
    title,
    tabs,
    setTab,
    loading,
    totalItems,
  } = props;
  const colsNumber = table.getAllColumns().length;
  const rowsNumber = table.getExpandedRowModel().rows.length;
  const {
    pagination: { pageIndex, pageSize },
  } = table.getState();

  const getCurrentPageItems = () => {
    const { rows } = table.getPaginationRowModel();
    const first = pageIndex * pageSize + 1;
    const last = first - 1 + rows.length;

    return { first, last };
  };

  const tableHeaders = table.getFlatHeaders();
  const tableRows = table.getRowModel().rows;

  const renderMobileTable = () => (
    <StyledMobileTable>
      {tableRows.map((row) => (
        <StyledMobileRow key={`${row.id}/desktop`}>
          {row.getVisibleCells().map((cell, idx) => (
            <StyledMobileCell key={`${cell.id}/desktop`}>
              <div className="header">
                {(() => {
                  const currentHeader = tableHeaders.find(
                    (header) => header.index === idx,
                  );
                  return !currentHeader || currentHeader.isPlaceholder
                    ? null
                    : flexRender(
                        currentHeader.column.columnDef.header,
                        currentHeader.getContext(),
                      );
                })()}
              </div>
              <div className="data">
                {flexRender(
                  cell.column.columnDef.cell &&
                    (cell.column.columnDef.cell as CallableFunction)(cell),
                  {},
                )}
              </div>
            </StyledMobileCell>
          ))}
        </StyledMobileRow>
      ))}
    </StyledMobileTable>
  );

  const renderDesktopTable = () => (
    <StyledTableBody colsNumber={colsNumber}>
      <thead>
        <tr>
          {tableHeaders.map((header) => (
            <td key={`${header.id}/desktop`}>
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
        {tableRows.map((row) => (
          <tr key={`${row.id}/desktop`}>
            {row.getVisibleCells().map((cell) => {
              return (
                <td key={`${cell.id}/desktop`}>
                  {flexRender(
                    cell.column.columnDef.cell &&
                      (cell.column.columnDef.cell as CallableFunction)(cell),
                    {},
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </StyledTableBody>
  );

  const isSmallScreen = isMobile || isTablet;

  return (
    <StyledTableWrapper>
      <StyledTableHeader>
        <Heading type="h3">{title}</Heading>
        {tabs && tabs?.length > 1 && (
          <StyledTabsWrapper>
            {tabs.map((tabItem) => (
              <StyledTabItem
                key={tabItem}
                selected={tabItem === tab}
                onClick={() =>
                  (setTab as Dispatch<SetStateAction<S>>)(tabItem as S)
                }
              >
                {tabItem}
              </StyledTabItem>
            ))}
          </StyledTabsWrapper>
        )}
      </StyledTableHeader>
      {loading ? (
        <StyledTablePlaceholder>Loading...</StyledTablePlaceholder>
      ) : null}
      {!loading && !rowsNumber && (
        <StyledTablePlaceholder>
          <Icon name="Coins" />
          No data available
        </StyledTablePlaceholder>
      )}
      {isSmallScreen
        ? !loading && !!rowsNumber && renderMobileTable()
        : !loading && !!rowsNumber && renderDesktopTable()}
      <StyledTableFooter>
        {!loading && rowsNumber ? (
          <>
            {!isSmallScreen && (
              <StyledPerPageWrapper>
                Show:
                <StyledPerPageSelect>
                  <select
                    onChange={({ target }) => {
                      table.setPageSize(Number(target.value));
                    }}
                    value={pageSize}
                  >
                    {perPageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <Icon name="DropdownIcon" className="dropdown-icon" />
                </StyledPerPageSelect>
              </StyledPerPageWrapper>
            )}
            {isSmallScreen ? (
              <>
                <Button
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                >
                  <Icon name="PrevPage" />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                >
                  Next
                  <Icon name="NextPage" />
                </Button>
              </>
            ) : (
              <Pagination
                totalItems={totalItems || rowsNumber}
                currentItems={getCurrentPageItems()}
                isPrevDisabled={!table.getCanPreviousPage()}
                isNextDisabled={!table.getCanNextPage()}
                onNextPageClick={() => table.nextPage()}
                onPrevPageClick={() => table.previousPage()}
                onFirstPageClick={() => table.setPageIndex(0)}
                onLastPageClick={() =>
                  table.setPageIndex(
                    Math.ceil(totalItems || rowsNumber / pageSize) - 1,
                  )
                }
              />
            )}
          </>
        ) : null}
      </StyledTableFooter>
    </StyledTableWrapper>
  );
};

Table.defaultProps = {
  tabs: [],
  setTab: () => {},
  totalItems: 0,
};

export default Table;
