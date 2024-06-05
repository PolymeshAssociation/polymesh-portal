import React, { useMemo } from 'react';
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
  StyledMobileTable,
  StyledMobileRow,
  StyledMobileCell,
  ClickableTableCell,
} from './styles';
import { IApplication } from '~/context/AccountContext/constants';
import { capitalizeFirstLetter } from '~/helpers/formatters';
import { useWindowWidth } from '~/hooks/utility';
import { useAuthContext } from '~/context/AuthContext';
import { TIdentityModalType } from '~/context/AuthContext/constants';
import { Text } from '~/components/UiKit';

const ApplicationTable: React.FC<{ applications: IApplication[] }> = ({
  applications,
}) => {
  const { setIdentityPopup } = useAuthContext();
  const { isMobile } = useWindowWidth();

  const handleApplicationClick = (provider: string, url: string) => {
    setIdentityPopup({
      type: provider as TIdentityModalType,
      applicationUrl: url,
    });
  };

  const sortedApplications = useMemo(() => {
    return applications.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [applications]);

  const renderDesktopTable = () => (
    <Table>
      <thead>
        <tr>
          <TableHeader>Provider</TableHeader>
          <TableHeader>Link Creation Date</TableHeader>
          <TableHeader>Application ID</TableHeader>
        </tr>
      </thead>
      <tbody>
        {sortedApplications.map((application) => (
          <TableRow key={application.id}>
            <TableCell>
              <Text size="medium">
                {capitalizeFirstLetter(application.provider)}
              </Text>
            </TableCell>
            <TableCell>
              <Text size="medium">
                {new Date(application.timestamp).toLocaleString()}
              </Text>
            </TableCell>
            <ClickableTableCell
              onClick={() =>
                handleApplicationClick(application.provider, application.url)
              }
            >
              <Text size="medium">{application.id}</Text>
            </ClickableTableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );

  const renderMobileTable = () => (
    <StyledMobileTable>
      {sortedApplications.map((application) => (
        <StyledMobileRow
          key={application.id}
          onClick={() =>
            handleApplicationClick(application.provider, application.url)
          }
        >
          <StyledMobileCell>
            <div className="header capitalized ">Provider</div>
            <div className="data">
              {capitalizeFirstLetter(application.provider)}
            </div>
          </StyledMobileCell>
          <StyledMobileCell>
            <div className="header">Link Creation Date</div>
            <div className="data">
              {new Date(application.timestamp).toLocaleString()}
            </div>
          </StyledMobileCell>
          <StyledMobileCell>
            <div className="header">Application ID</div>
            <div className="data clickable">{application.id}</div>
          </StyledMobileCell>
        </StyledMobileRow>
      ))}
    </StyledMobileTable>
  );

  return isMobile ? renderMobileTable() : renderDesktopTable();
};

export default ApplicationTable;
