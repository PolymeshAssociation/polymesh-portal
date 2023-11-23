import { IMultiSigListItem } from '../../../../types';
import { ArgsTable } from '../ArgsTable';
import { DetailsData } from '../DetailsData';
import { SignersDropdown } from '../SignersDropdown';

interface IListItemDetailsProps {
  item: IMultiSigListItem;
  detailsExpanded: boolean;
  showStatus?: boolean;
  isHistorical?: boolean;
}

export const ListItemDetails: React.FC<IListItemDetailsProps> = ({
  item,
  detailsExpanded,
  showStatus = false,
  isHistorical = false,
}) => {
  return (
    <>
      <DetailsData
        item={item}
        showStatus={showStatus}
        isHistorical={isHistorical}
      />
      {detailsExpanded && (
        <>
          <SignersDropdown
            votes={item.votes.nodes}
            isHistorical={isHistorical}
          />
          {item?.args && (
            <ArgsTable
              rawArgs={item.args}
              module={item.module}
              call={item.call}
              callIndex={item.callIndex}
              id={item.proposalId}
            />
          )}
        </>
      )}
    </>
  );
};
