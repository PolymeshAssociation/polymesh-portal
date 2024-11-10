import { FC, useState } from 'react';
import clsx from 'clsx';
import { Icon, Table } from '~/components';
import { IRawMultiSigVote } from '~/constants/queries/types';
import { useSignersTable } from './hooks';
import { StyledSignersContainer, StyledHeader } from './styles';

interface ISignersDropdownProps {
  votes: IRawMultiSigVote[];
  isHistorical: boolean;
}

export const SignersDropdown: FC<ISignersDropdownProps> = ({
  votes,
  isHistorical,
}) => {
  const { table, tableLoading, totalItems } = useSignersTable(
    votes,
    isHistorical,
  );

  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <StyledSignersContainer>
      <StyledHeader onClick={toggleExpanded} $expanded={expanded}>
        <span>Signers</span>
        <Icon name="ExpandIcon" size="18px" className={clsx('expand-icon')} />
      </StyledHeader>
      {expanded && (
        <Table
          data={{ table }}
          loading={tableLoading}
          totalItems={totalItems}
        />
      )}
    </StyledSignersContainer>
  );
};
