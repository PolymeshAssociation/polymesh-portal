import { Text } from '~/components/UiKit';
import { BlockedWallets } from './components/BlockedWallets';
import { DefaultAddress } from './components/DefaultAddress';
import { DefaultWallet } from './components/DefaultWallet';
import { MenuItem } from './components/MenuItem';
import { RpcUrl } from './components/RpcUrl';
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
          iconName="Wallet"
          description="Default Wallet"
          value={<DefaultWallet />}
        />
        <MenuItem
          iconName="Home"
          description="Default Wallet Address"
          value={<DefaultAddress />}
        />
        <MenuItem
          iconName="MinusCircle"
          description="Blocked Wallets"
          value={<BlockedWallets />}
        />
        <MenuItem iconName="Link" description="RPC URL" value={<RpcUrl />} />
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
          iconName="Brush"
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
