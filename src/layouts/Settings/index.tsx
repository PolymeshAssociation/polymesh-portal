/* eslint-disable no-underscore-dangle */
import { useContext, useEffect, useState } from 'react';
import { Text } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { BlockedWallets } from './components/BlockedWallets';
import { DefaultAddress } from './components/DefaultAddress';
import { DefaultWallet } from './components/DefaultWallet';
import { MenuItem } from './components/MenuItem';
import { EndpointUrl, EndpointTypes } from './components/EndpointUrl';
import { IpfsProvider } from './components/IpfsProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { StyledMenuList, StyledSettings } from './styles';
import { useWindowWidth } from '~/hooks/utility';

interface IChainInfo {
  runtime: {
    name: string;
    version: string;
  };
  chain: string;
  system: {
    name: string;
    version: string;
  };
}

const Settings = () => {
  const {
    api: { polkadotApi, sdk },
    state: { middlewareMetadata },
    refreshMiddlewareMetadata,
  } = useContext(PolymeshContext);
  const [chainInfo, setChainInfo] = useState<IChainInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const { isMobile } = useWindowWidth();

  useEffect(() => {
    if (!sdk || !polkadotApi) return;
    (async () => {
      setInfoLoading(true);
      const runtimeVersion = polkadotApi.runtimeVersion.toHuman();

      const info = {
        runtime: {
          name: runtimeVersion.specName as string,
          version: runtimeVersion.specVersion as string,
        },
        chain: polkadotApi.runtimeChain.toHuman(),
        system: {
          name: (await polkadotApi.rpc.system.name()).toHuman() as string,
          version: (await polkadotApi.rpc.system.version()).toHuman() as string,
        },
      };

      setChainInfo(info);
      setInfoLoading(false);
    })();
  }, [polkadotApi, sdk]);

  useEffect(() => {
    refreshMiddlewareMetadata();
  }, [refreshMiddlewareMetadata]);

  return (
    <StyledSettings>
      <Text size="large" bold color="secondary" marginBottom={28}>
        Wallet Settings
      </Text>
      <StyledMenuList>
        <MenuItem
          iconName="Wallet"
          description={
            isMobile ? 'Selected Wallet' : 'Currently Selected Wallet'
          }
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
        <MenuItem
          iconName="Link"
          description="RPC URL"
          value={<EndpointUrl type={EndpointTypes.RPC} />}
        />
        <MenuItem
          iconName="Link"
          description="Middleware URL"
          value={<EndpointUrl type={EndpointTypes.MIDDLEWARE} />}
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
          iconName="Link"
          description="IPFS Provider"
          value={<IpfsProvider />}
        />
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
        marginBottom={28}
      >
        Connected Chain Information
      </Text>
      {infoLoading || !chainInfo ? (
        'Loading...'
      ) : (
        <StyledMenuList>
          <MenuItem
            description="Runtime version"
            value={`${chainInfo.runtime.name}/${chainInfo.runtime.version}`}
          />
          <MenuItem description="Chain" value={chainInfo.chain} />
          <MenuItem
            description="System version"
            value={`${chainInfo.system.name} - ${chainInfo.system.version}`}
          />
        </StyledMenuList>
      )}
      <Text
        size="large"
        bold
        color="secondary"
        marginTop={40}
        marginBottom={28}
      >
        Connected Middleware Information
      </Text>
      {!middlewareMetadata ? (
        'Loading...'
      ) : (
        <StyledMenuList>
          <MenuItem
            description="Polymesh SubQuery Version"
            value={middlewareMetadata.sqVersion}
          />
          <MenuItem
            description="Middleware Indexer Healthy"
            value={middlewareMetadata.indexerHealthy ? 'Yes' : 'No'}
          />
          <MenuItem
            description="Middleware Last Processed Block"
            value={middlewareMetadata.lastProcessedHeight.toString()}
          />
          <MenuItem
            description="Middleware Last Processed Timestamp"
            value={middlewareMetadata.lastProcessedTimestamp.toLocaleString()}
          />
        </StyledMenuList>
      )}
    </StyledSettings>
  );
};

export default Settings;
