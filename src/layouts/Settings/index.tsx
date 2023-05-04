import { Text } from '~/components/UiKit';
import { DefaultWallet } from './components/DefaultWallet';
import { MenuItem } from './components/MenuItem';
import { ThemeToggle } from './components/ThemeToggle';
import { StyledMenuList, StyledSettings } from './styles';

const Settings = () => {
  return (
    <StyledSettings>
      <Text size="large" bold color="secondary" marginBottom={28}>
        Wallet Settings
      </Text>
      <StyledMenuList>
        <MenuItem
          iconName="Coins"
          description="Default Wallet"
          value={<DefaultWallet />}
        />
        <MenuItem
          iconName="Coins"
          description="Default Wallet Address"
          value="xdxx...fVqd7"
        />
        <MenuItem iconName="Coins" description="Blocked Wallets" value="2" />
        <MenuItem
          iconName="Coins"
          description="RPC URL"
          value="https://example.com"
        />
      </StyledMenuList>
      <Text
        size="large"
        bold
        color="secondary"
        marginTop={40}
        marginBottom={28}
      >
        View Settings
      </Text>
      <StyledMenuList>
        <MenuItem
          iconName="Coins"
          description="Theme"
          value={<ThemeToggle />}
        />
      </StyledMenuList>
      <Text
        size="large"
        bold
        color="secondary"
        marginTop={40}
        marginBottom={12}
      >
        Connected Chain Information
      </Text>
      <Text size="large" bold>
        Test example
      </Text>
    </StyledSettings>
  );
};

export default Settings;
