# Polymesh Portal

The Polymesh Portal is a user-friendly interface for interacting with a Polymesh Blockchain account. It's built with the [Polymesh SDK](https://github.com/PolymeshAssociation/polymesh-sdk) and utilizes the [Polymesh Browser Extension Signing Manager](https://github.com/PolymeshAssociation/signing-managers/tree/main/packages/browser-extension-signing-manager) and [Polymesh SubQuery GraphQL API](https://github.com/PolymeshAssociation/polymesh-subquery). This portal serves as a reference implementation for developers building on Polymesh.

## Features

### Multiple Wallet Support

Connect with ease using Polymesh, Polkadot, Talisman, or Subwallet on desktop. Mobile users can connect with SubWallet and Nova Wallet. More [Polkadot extension](https://github.com/polkadot-js/extension) based wallets are possible. For wallet support requests, reach out to the Polymesh team.

### Responsive Design and Mobile Compatibility

Crafted with a responsive design for seamless use on different devices, including mobile phones and tablets. Connect with a compatible mobile wallet for on-the-go access to manage your Polymesh assets and transactions.

### Comprehensive Feature Set

#### Overview Page

- Provides a snapshot of the connected Polymesh account.
- Displays POLYX token balances, account status, identity ID, signing key details, transaction history, and asset transfer history.
- Allows sending/receiving POLYX and removal of signing keys.

#### Portfolio Page

- Efficiently manage Fungible and Non-fungible assets and customize portfolios.
- View total balances and locked tokens.
- View Fungible asset details such as metadata, related documents of the asset you hold.
- View NFT Collection details.
- View individual NFT details.
- Add, remove, or rename portfolios, and move funds between them.
- View Portfolio specific transaction and movement history.

#### Transfers Page

- Streamlined management of settlement instructions.
- Full support for Fungible and Non-fungible assets.
- View pending, affirmed, and failed settlement instructions with full details.
- Supports creation of settlement venues and basic/advanced settlement instructions.

#### Authorizations Page

- Centralized hub for permission actions.
- View details of incoming and outgoing authorizations.
- Create new authorizations for actions such as the transfer of ticker, transfer of asset ownership, request a key to join the identity, adding relayer paying keys, assignment of portfolio custody to another identity, and more.

#### Claims Page

- Efficient management of account claims.
- View details of received or issued claims.
- Create claims for use with on-chain asset compliance rules.

#### Distributions Page

- Easy access to capital distributions.
- View details of pending, claimed, and historical distributions.

#### Settings Page

- Customize and configure the portal according to preferences.
- Change connected wallet, set default address, block specific wallets, select RPC endpoints, and switch themes.

## Community and Contribution

The Polymesh Portal is open source. Contribute through bug reports, feature requests, or pull requests. Follow us on [Twitter](https://twitter.com/PolymeshNetwork) and join the community on [Discord](https://discord.gg/9TdzKbKgSU) to unlock the full potential of the Polymesh ecosystem!

## Installation

1. Clone the repository:

   ```shell
   git clone https://github.com/PolymeshAssociation/polymesh-portal.git
   ```

2. Navigate to the project directory:

   ```shell
   cd polymesh-portal
   ```

3. Install dependencies using Yarn:

   ```shell
   yarn
   ```

## Configuration

Configure node and middleware endpoints with environment variables. Testnet configuration is in `.env.development`. For production, use `.env.production`. Additionally, you can change the runtime node and middleware endpoints via the website's `Settings` page of a deployed site.

## Local Development

Run the portal locally for development:

```shell
yarn dev
```

This starts a local development server for testing. Any changes you make to the code will be reflected live without the need to restart the server.

## Build

Generate static content for hosting:

```shell
yarn build
```

Deploy contents of the `dist` directory to a hosting service of your choice.
