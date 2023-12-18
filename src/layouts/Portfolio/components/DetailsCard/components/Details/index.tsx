import { PropertiesDropdown } from '../PropertiesDropdown';
import { PropertiesItem } from '../PropertiesItem';
import { getDateTime, isValidLink } from '../../helpers';
import { formatDid } from '~/helpers/formatters';

interface IDetailsProps {
  details: any;
}

export const Details: React.FC<IDetailsProps> = ({ details }) => {
  return (
    <PropertiesDropdown label="Details" expanded>
      <>
        <PropertiesItem propKey="Name" propValue={details.name} />
        <PropertiesItem
          propKey="Created At"
          propValue={getDateTime(details.createdAt)}
        />
        <PropertiesItem
          propKey="Total supply"
          propValue={details.totalSupply}
        />
        <PropertiesItem
          propKey="Owner"
          propValue={formatDid(details.owner)}
          propCopy={details.owner}
          isPink
        />
        {details.metaData.map((meta: any) => (
          <PropertiesItem
            key={meta.name}
            propKey={meta.name}
            propValue={meta.value}
            propDescription={meta.description}
            propIsLocked={meta.isLocked}
            propExpiry={meta.expiry}
            propUrl={isValidLink(meta?.value)}
            isPink={!!isValidLink(meta?.value)}
          />
        ))}
      </>
    </PropertiesDropdown>
  );
};
