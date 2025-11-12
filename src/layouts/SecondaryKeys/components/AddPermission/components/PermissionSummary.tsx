import {
  SummarySection,
  SummaryCard,
  SummaryTitle,
  SummaryText,
  SelectedItemsList,
  SelectedItem,
} from '../styles';

interface IPermissionSummaryProps {
  secondaryKey: string;
  permissions: {
    assets: {
      type: 'Whole' | 'These' | 'Except' | 'None';
      values: string[];
    };
    transactions: {
      type: 'Whole' | 'These' | 'None';
      values: Array<{ pallet: string; extrinsics?: string[] }>;
    };
    portfolios: {
      type: 'Whole' | 'These' | 'Except' | 'None';
      values: string[];
    };
  };
}

export const PermissionSummary = ({
  secondaryKey,
  permissions,
}: IPermissionSummaryProps) => {
  const formatPermissionType = (type: 'Whole' | 'These' | 'Except' | 'None') => {
    switch (type) {
      case 'Whole':
        return 'Full access';
      case 'These':
        return 'Specific items only';
      case 'Except':
        return 'All except specific items';
      case 'None':
        return 'No access';
    }
  };

  return (
    <SummarySection>
      <SummaryCard>
        <SummaryTitle>Secondary Key</SummaryTitle>
        <SummaryText>{secondaryKey || 'Not selected'}</SummaryText>
      </SummaryCard>

      <SummaryCard>
        <SummaryTitle>Assets Permission</SummaryTitle>
        <SummaryText>{formatPermissionType(permissions.assets.type)}</SummaryText>
        {permissions.assets.values.length > 0 && (
          <SelectedItemsList>
            {permissions.assets.values.map((asset, index) => (
              <SelectedItem key={index}>{asset}</SelectedItem>
            ))}
          </SelectedItemsList>
        )}
      </SummaryCard>

      <SummaryCard>
        <SummaryTitle>Extrinsics Permission</SummaryTitle>
        <SummaryText>
          {formatPermissionType(permissions.transactions.type)}
        </SummaryText>
        {permissions.transactions.values.length > 0 && (
          <SelectedItemsList>
            {permissions.transactions.values.flatMap((item) =>
              item.extrinsics && item.extrinsics.length > 0
                ? item.extrinsics.map((extrinsic, idx) => (
                    <SelectedItem key={`${item.pallet}.${extrinsic}-${idx}`}>
                      {item.pallet}.{extrinsic}
                    </SelectedItem>
                  ))
                : <SelectedItem key={item.pallet}>{item.pallet} (all methods)</SelectedItem>
            )}
          </SelectedItemsList>
        )}
      </SummaryCard>

      <SummaryCard>
        <SummaryTitle>Portfolios Permission</SummaryTitle>
        <SummaryText>
          {formatPermissionType(permissions.portfolios.type)}
        </SummaryText>
        {permissions.portfolios.values.length > 0 && (
          <SelectedItemsList>
            {permissions.portfolios.values.map((portfolio, index) => (
              <SelectedItem key={index}>{portfolio}</SelectedItem>
            ))}
          </SelectedItemsList>
        )}
      </SummaryCard>
    </SummarySection>
  );
};
