import React from 'react';
import { HeaderContext } from '@tanstack/react-table';
import styled from 'styled-components';
import { Icon } from '~/components';

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`;

export interface SortHeaderProps<TData, TValue> {
  header: HeaderContext<TData, TValue>;
  label: React.ReactNode;
}

export const SortHeader = <TData, TValue>({
  header,
  label,
}: SortHeaderProps<TData, TValue>) => {
  const sortOrder = header.column.getIsSorted();
  const handleSort = header.column.getToggleSortingHandler();

  return (
    <HeaderContainer onClick={handleSort}>
      {label}
      {sortOrder === 'asc' && <Icon name="SortAscending" size="18px" />}
      {sortOrder === 'desc' && <Icon name="SortDescending" size="18px" />}
      {!sortOrder && <Icon name="Sort" size="18px" />}
    </HeaderContainer>
  );
};
