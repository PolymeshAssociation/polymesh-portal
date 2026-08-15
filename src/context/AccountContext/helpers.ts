import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import {
  EthSigningManager,
  ethAddressFromSs58,
} from '@polymeshassociation/eth-signing-manager';
import { Wallet } from '~/constants/wallets';
import { formatKey } from '~/helpers/formatters';

/**
 * Present the Accounts of an Ethereum Signing Manager in the shape the rest of the Portal expects.
 *
 * The Portal models accounts as `InjectedAccountWithMeta`, which comes from the Polkadot extension
 * world and has no equivalent here — an Ethereum wallet exposes no account names to a dApp. So the
 * controlling `0x` address is used as the name: it is the identifier the user actually recognises
 * from their wallet, and it is otherwise invisible once the address is SS58-encoded.
 *
 * It is abbreviated because the display slot ellipsis-truncates on overflow, which would hide the
 * trailing characters — the half of the address people actually check.
 *
 * @param addresses - SS58-encoded, Ethereum-derived addresses as returned by `getAccounts()`
 */
export const toEthAccountsWithMeta = (
  addresses: string[],
): InjectedAccountWithMeta[] =>
  addresses.map((address) => ({
    address,
    meta: {
      name: formatKey(ethAddressFromSs58(address), 8, 6),
      source: Wallet.METAMASK,
    },
    // secp256k1, though the chain never verifies a signature over a SCALE payload for these keys.
    type: 'ecdsa' as const,
  }));

/**
 * Read the current Accounts from an Ethereum Signing Manager.
 *
 * Needed because `EthSigningManager.onAccountChange` only subscribes to the provider's
 * `accountsChanged` event — unlike the extension and WalletConnect managers it does not replay the
 * current Accounts on subscribe, so without this the account list stays empty until the user happens
 * to switch accounts in their wallet.
 */
export const getEthAccountsWithMeta = async (
  signingManager: EthSigningManager,
): Promise<InjectedAccountWithMeta[]> =>
  toEthAccountsWithMeta(await signingManager.getAccounts());
