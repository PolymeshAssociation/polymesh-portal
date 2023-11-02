import { IMultiSigListItem } from '../../../../types';
import { ArgsTable } from '../ArgsTable';
import { DetailsData } from '../DetailsData';
import { SignersDropdown } from '../SignersDropdown';

interface IListItemDetailsProps {
  item: IMultiSigListItem;
  detailsExpanded: boolean;
  showStatus?: boolean;
}

export const ListItemDetails: React.FC<IListItemDetailsProps> = ({
  item,
  detailsExpanded,
  showStatus = false,
}) => (
  <>
    <DetailsData item={item} showStatus={showStatus} />
    {detailsExpanded && (
      <>
        <SignersDropdown votes={item.votes.nodes} />
        {item?.args && (
          <ArgsTable
            rawArgs={item.args}
            module={item.module}
            call={item.call}
            id={item.proposalId}
          />
        )}
      </>
    )}
  </>
);
