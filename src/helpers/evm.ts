import type { Eip1193Provider } from '@polymeshassociation/eth-signing-manager';
import type { Polymesh } from '@polymeshassociation/polymesh-sdk';

type TPolkadotApi = Polymesh['_polkadotApi'];

/**
 * Reverse-DNS identifier MetaMask announces itself with under EIP-6963.
 */
const METAMASK_RDNS = 'io.metamask';

interface IEip6963ProviderInfo {
  uuid: string;
  name: string;
  rdns: string;
  icon: string;
}

interface IEip6963AnnounceEvent extends Event {
  detail: {
    info: IEip6963ProviderInfo;
    provider: Eip1193Provider;
  };
}

/**
 * Shape of the legacy `window.ethereum` injection. `providers` is present when several wallets are
 * installed side by side and one of them (typically Coinbase Wallet) multiplexes them.
 */
interface ILegacyInjectedProvider extends Eip1193Provider {
  isMetaMask?: boolean;
  providers?: ILegacyInjectedProvider[];
}

declare global {
  interface Window {
    ethereum?: ILegacyInjectedProvider;
  }
}

/**
 * Discover EIP-1193 providers announced under
 * [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963).
 *
 * Announcements are synchronous — a wallet responds to the request event in the same tick — but
 * some wallets announce on a microtask, so we collect for a short window before resolving.
 */
const discoverEip6963Providers = (
  timeoutMs = 300,
): Promise<{ info: IEip6963ProviderInfo; provider: Eip1193Provider }[]> => {
  if (typeof window === 'undefined') return Promise.resolve([]);

  return new Promise((resolve) => {
    const found = new Map<
      string,
      { info: IEip6963ProviderInfo; provider: Eip1193Provider }
    >();

    const onAnnounce = (event: Event) => {
      const { detail } = event as IEip6963AnnounceEvent;
      if (!detail?.info?.rdns) return;
      // Keyed by rdns so a wallet announcing more than once does not produce duplicates.
      found.set(detail.info.rdns, detail);
    };

    window.addEventListener('eip6963:announceProvider', onAnnounce);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    setTimeout(() => {
      window.removeEventListener('eip6963:announceProvider', onAnnounce);
      resolve([...found.values()]);
    }, timeoutMs);
  });
};

/**
 * Locate the MetaMask provider.
 *
 * EIP-6963 is tried first, since it is the only reliable way to single MetaMask out when several
 * wallets are installed. Falls back to the legacy `window.ethereum` injection for older builds.
 *
 * @returns the provider, or `null` when MetaMask is not installed
 */
export const getMetaMaskProvider =
  async (): Promise<Eip1193Provider | null> => {
    const announced = await discoverEip6963Providers();
    const metaMask = announced.find(({ info }) => info.rdns === METAMASK_RDNS);
    if (metaMask) return metaMask.provider;

    const injected =
      typeof window === 'undefined' ? undefined : window.ethereum;
    if (!injected) return null;

    // When several wallets are injected they are multiplexed behind `providers`.
    if (Array.isArray(injected.providers)) {
      return injected.providers.find((provider) => provider.isMetaMask) ?? null;
    }

    return injected.isMetaMask ? injected : null;
  };

/**
 * Whether MetaMask appears to be installed. Cheap, synchronous best-effort check for rendering the
 * wallet picker — {@link getMetaMaskProvider} is the authoritative one.
 */
export const isMetaMaskInstalled = (): boolean => {
  const injected = typeof window === 'undefined' ? undefined : window.ethereum;
  if (!injected) return false;
  if (Array.isArray(injected.providers)) {
    return injected.providers.some((provider) => provider.isMetaMask);
  }
  return !!injected.isMetaMask;
};

export interface IEvmChainConfig {
  /** 0x-prefixed hex chain ID, as `wallet_addEthereumChain` expects */
  chainId: string;
  chainName: string;
  /**
   * Ethereum JSON-RPC endpoints for the chain. MetaMask broadcasts through its own configured RPC
   * (Mode B), so at least one is required for it to be able to submit at all
   */
  rpcUrls: string[];
  nativeCurrency: { name: string; symbol: string; decimals: number };
  blockExplorerUrls?: string[];
}

/** EIP-1193 error code returned when the requested chain is not known to the wallet */
const CHAIN_NOT_ADDED_CODE = 4902;

const getErrorCode = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;
  const { code } = error as { code?: unknown };
  return typeof code === 'number' ? code : undefined;
};

/**
 * Convert a chain ID to the 0x-prefixed, unpadded hex string EIP-1193 methods expect.
 */
const toHexChainId = (chainId: bigint | number | string): string =>
  `0x${BigInt(chainId).toString(16)}`;

/**
 * Whether two chain IDs refer to the same chain.
 *
 * Compared numerically rather than as strings: `eth_chainId` is specified to return unpadded hex,
 * but wallets and WalletConnect relays have been known to return a padded or decimal value, and a
 * string comparison would report that as a network mismatch.
 *
 * An unparseable value is treated as a mismatch, so an unreadable chain ID is never mistaken for
 * agreement.
 */
export const isSameChainId = (a: string, b: string): boolean => {
  try {
    return BigInt(a) === BigInt(b);
  } catch {
    return false;
  }
};

/**
 * Read the chain the provider is currently connected to.
 *
 * Only needed before a Signing Manager exists — once one is connected,
 * `EthSigningManager.getCurrentNetwork()` reports the same thing.
 */
const getProviderChainId = async (
  provider: Eip1193Provider,
): Promise<string> => {
  const chainId = await provider.request({ method: 'eth_chainId' });
  return String(chainId);
};

/**
 * Ensure the wallet is pointed at the Polymesh chain, switching (and adding it first, if unknown)
 * when it is not.
 *
 * This matters because MetaMask signs *and broadcasts* (Mode B): it submits through whichever
 * network it is currently on, so a mismatch means the transaction is either rejected or sent to an
 * entirely different chain. The SDK's own submission path is unaffected — it uses the Substrate
 * connection — but the wallet still has to be on the right network to broadcast.
 *
 * @throws if the user rejects the switch, or the wallet refuses to add the chain
 */
export const ensureEvmNetwork = async (
  provider: Eip1193Provider,
  config: IEvmChainConfig,
): Promise<void> => {
  const current = await getProviderChainId(provider);

  if (isSameChainId(current, config.chainId)) return;

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: config.chainId }],
    });
    return;
  } catch (error) {
    if (getErrorCode(error) !== CHAIN_NOT_ADDED_CODE) {
      throw error;
    }
  }

  if (!config.rpcUrls.length) {
    throw new Error(
      `MetaMask does not have the Polymesh network (chain ID ${config.chainId}) configured, and no Ethereum RPC URL is available to add it. Set VITE_ETH_RPC_URL, or add the network in MetaMask manually`,
    );
  }

  await provider.request({
    method: 'wallet_addEthereumChain',
    params: [config],
  });
};

/**
 * Ethereum-side decimals for POLYX.
 *
 * The chain stores balances with 6 decimals; `revive` scales them by `nativeToEthRatio` (10^12) so
 * that Ethereum tooling, which assumes 18, sees the right value.
 */
const POLYX_EVM_DECIMALS = 18;

/**
 * Build the `wallet_addEthereumChain` parameters for the connected Polymesh node.
 *
 * The chain ID is read from chain metadata rather than configured, so it always matches the node the
 * Portal is actually talking to. The RPC URL cannot be derived — it is a separate `eth-rpc` proxy
 * that fronts the node — so it comes from configuration and may legitimately be absent, in which
 * case the wallet can still switch to an already-known network but not add a new one.
 */
export const buildEvmChainConfig = (
  api: TPolkadotApi,
  {
    rpcUrl,
    chainName,
    explorerUrl,
  }: { rpcUrl?: string; chainName: string; explorerUrl?: string },
): IEvmChainConfig => ({
  chainId: toHexChainId(api.consts.revive.chainId.toString()),
  chainName,
  rpcUrls: rpcUrl ? [rpcUrl] : [],
  nativeCurrency: {
    name: 'POLYX',
    symbol: 'POLYX',
    decimals: POLYX_EVM_DECIMALS,
  },
  ...(explorerUrl ? { blockExplorerUrls: [explorerUrl] } : {}),
});
