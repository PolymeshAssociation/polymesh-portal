import { ReactNode, FC, useContext } from 'react';
import { SkeletonLoader } from '~/components/UiKit';
import {
  TMultiSigArgs,
  TMultiSigCallArgs,
  TMultiSigArgsFormatted,
} from '../../../../types';
import { processCallParameters, isPrimitive, parseValue } from './helpers';
import {
  StyledSkeletonWrapper,
  StyledTableWrapper,
  StyledTable,
  StyledTableRow,
  StyledTableSubRow,
  StyledTableCell,
  StyledTableHeadCell,
  StyledTableHeadContent,
} from './styles';
import { PolymeshContext } from '~/context/PolymeshContext';
import { capitalizeFirstLetter } from '~/helpers/formatters';

interface IArgsTableProps {
  rawArgs: TMultiSigArgs;
  call: string;
  module: string;
}

export const ArgsTable: FC<IArgsTableProps> = ({ rawArgs, call, module }) => {
  const args = [
    {
      module: capitalizeFirstLetter(module),
      call: capitalizeFirstLetter(call),
      args: rawArgs,
    },
  ];
  const {
    api: { polkadotApi },
  } = useContext(PolymeshContext);

  const renderTable = (
    paramsToRender: unknown,
    isFirstRender: boolean = false,
  ): ReactNode => {
    if (isPrimitive(paramsToRender as string | number | boolean)) {
      return (
        <StyledTableCell>{`${parseValue(
          paramsToRender as string | number,
        )}`}</StyledTableCell>
      );
    }
    if (Array.isArray(paramsToRender)) {
      if (paramsToRender.length > 1) {
        return paramsToRender.map((param: TMultiSigArgsFormatted, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <StyledTableRow key={i} $withBorder={isFirstRender}>
            <StyledTableHeadCell>
              <StyledTableHeadContent>{i}</StyledTableHeadContent>
            </StyledTableHeadCell>
            <StyledTableSubRow>
              {renderTable(param as unknown)}
            </StyledTableSubRow>
          </StyledTableRow>
        ));
      }
      return renderTable(paramsToRender[0]);
    }
    if (typeof paramsToRender === 'object') {
      const renderableParams = processCallParameters(
        paramsToRender!,
        polkadotApi!,
      );
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

  if (!args.length || !polkadotApi) {
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
