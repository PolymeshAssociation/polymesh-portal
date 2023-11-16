import { ReactNode, FC } from 'react';
import { SkeletonLoader } from '~/components/UiKit';
import {
  TMultiSigArgs,
  TMultiSigCallArgs,
  TMultiSigArgsFormatted,
} from '../../../../types';
import { useMultiSigItemArgs } from './hooks';
import { convertIfNameValue, isPrimitive, parseValue } from './helpers';
import {
  StyledSkeletonWrapper,
  StyledTableWrapper,
  StyledTable,
  StyledTableRow,
  StyledTableSubRow,
  StyledTableCell,
  StyledTableHeadCell,
  StyledTableHeadContent,
  StyledTableSection,
} from './styles';

interface IArgsTableProps {
  rawArgs: TMultiSigArgs;
  call: string;
  callIndex: string;
  module: string;
  id: number;
}

export const ArgsTable: FC<IArgsTableProps> = ({
  rawArgs,
  call,
  callIndex,
  module,
  id,
}) => {
  const args = useMultiSigItemArgs(id, module, call, rawArgs, callIndex);

  const renderTable = (
    paramsToRender: unknown,
    isFirstRender: boolean = false,
  ): ReactNode => {
    if (isPrimitive(paramsToRender as string | number)) {
      return (
        <StyledTableCell>{`${parseValue(
          paramsToRender as string | number,
        )}`}</StyledTableCell>
      );
    }
    if (Array.isArray(paramsToRender)) {
      return paramsToRender.map((param: TMultiSigArgsFormatted, i) =>
        isFirstRender ? (
          // eslint-disable-next-line react/no-array-index-key
          <StyledTableSection key={i}>{renderTable(param)}</StyledTableSection>
        ) : (
          renderTable(param)
        ),
      );
    }
    if (typeof paramsToRender === 'object') {
      const renderableParams = convertIfNameValue(paramsToRender!);
      return Object.entries(renderableParams as TMultiSigArgs).map(
        ([key, value], i) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <StyledTableRow key={i} $withBorder={isFirstRender}>
              <StyledTableHeadCell>
                <StyledTableHeadContent>{key}</StyledTableHeadContent>
              </StyledTableHeadCell>
              <StyledTableSubRow>
                {renderTable(value as unknown)}
              </StyledTableSubRow>
            </StyledTableRow>
          );
        },
      );
    }
    return null;
  };

  if (!args.length) {
    return (
      <StyledSkeletonWrapper>
        <SkeletonLoader height={200} />
      </StyledSkeletonWrapper>
    );
  }

  return (
    <StyledTableWrapper>
      <StyledTable>
        {renderTable(
          args as TMultiSigArgsFormatted[] | TMultiSigCallArgs,
          true,
        )}
      </StyledTable>
    </StyledTableWrapper>
  );
};
