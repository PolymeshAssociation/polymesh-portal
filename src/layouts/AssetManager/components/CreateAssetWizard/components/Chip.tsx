import React from 'react';
import styled from 'styled-components';
import { Icon } from '~/components';

interface ChipProps {
  label: string;
  onDelete: () => void;
}

const ChipContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 6px 12px;
  background-color: ${({ theme }) => theme.colors.pinkBackground};
  border-radius: 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  max-width: 100%;
`;

const ChipLabel = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 250ms ease-out;

  &:hover {
    color: ${({ theme }) => theme.colors.textPink};
    background-color: ${({ theme }) => theme.colors.dashboardBackground};
  }
`;

const Chip: React.FC<ChipProps> = ({ label, onDelete }) => {
  return (
    <ChipContainer>
      <ChipLabel>{label}</ChipLabel>
      <DeleteButton onClick={onDelete} type="button">
        <Icon name="Delete" size="16px" />
      </DeleteButton>
    </ChipContainer>
  );
};

export default Chip;
