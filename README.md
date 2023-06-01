# Polymesh Portal

The Polymesh Portal is an interface for interacting with an account on the Polymesh Blockchain. It showcases some of the rich features available on Polymesh. It is built with the [Polymesh SDK](https://github.com/PolymeshAssociation/polymesh-sdk) and uses the [Polymesh Browser Extension Signing Manager](https://github.com/PolymeshAssociation/signing-managers/tree/main/packages/browser-extension-signing-manager) and [Polymesh SubQuery GraphQL API](https://github.com/PolymeshAssociation/polymesh-subquery). This Portal serves as a reference implementation for developers seeking to build applications on Polymesh. As an open-source project, we actively encourage community contributions and feedback to enhance the platform's capabilities.

## Choose How You Connect with Multiple Wallet Support

The Polymesh Portal prioritizes user convenience by offering support for multiple wallets. On desktop devices, users can effortlessly connect their Polymesh, Polkadot, Talisman, or Subwallet wallets. Support for other [Polkadot extension](https://github.com/polkadot-js/extension) based wallets is possible. Mobile users, on the other hand, can take advantage of compatibility with SubWallet and Nova Wallet. If you have a specific wallet you would like to be supported by the Portal, please reach out to the Polymesh team.

## Responsive Design and Mobile Compatibility

The Polymesh Portal is meticulously crafted with a responsive design that seamlessly adapts to different devices, including mobile phones and tablets. Mobile users can leverage the portal's functionality by connecting with a compatible mobile wallet. This ensures that regardless of the platform you choose, you can conveniently access and manage your Polymesh assets and transactions on the go.

## Comprehensive Feature Set

The Polymesh Portal offers an extensive array of features that cater to diverse needs. Let's explore some of the key functionalities:

### Overview Page: A Comprehensive Snapshot of Your Polymesh Assets

The Overview Page serves as the entry point to the Portal, providing an overview of the connected Polymesh account. Users can access all the keys and identities associated with their connected wallet. The page displays important information such as POLYX token balances, account status, identity ID, associated signing key details, transaction history, asset transfer history, and provides users with notifications if they have pending actions. This user-friendly interface also allows for the sending and receiving of POLYX and removal of signing keys connected to the active account.

With the Transaction History feature, users gain a transparent record of all historical activity by the selected key on the Polymesh Blockchain and all asset movements by the active account. The activity and asset history interface leverages the SubQuery GraphQL API to access account-specific historical information.

### Portfolio Page: Effortless Asset Management and Portfolio Customization

The Portfolio Page empowers users to efficiently manage their assets and customize portfolios according to their preferences. Users can view an overview of all assets held under their selected identity, including the total balance and locked tokens across portfolios, or access individual portfolios. Furthermore, users can easily add, remove, or rename portfolios, move funds between portfolios, and explore portfolio-specific asset transfer history. With the Portfolio Page, users have full control over their asset allocation and portfolio composition.

### Transfers Page: Streamlined Management of Settlement Instructions

Managing settlement instructions becomes seamless with the Settlement Page. Users can effortlessly view pending, affirmed, and failed settlement instructions, complete with full details, affirmation status of other parties, and errors if compliance rules or transfer restrictions are not satisfied. Settlement instructions for portfolios owned by another identity but with custody assigned to the active account will also be shown so they can be actioned by the appointed custodian.

The page supports the creation of settlement venues and both basic and advanced settlement instructions. Advanced instructions support multiple legs and multiple parties, allowing for atomic swaps of assets without the need for a trusted escrow or smart contract.

Whether it's creating, reviewing, affirming, rejecting, or settling instructions, the Settlement Page provides a comprehensive interface for effective settlement management.

### Authorizations Page: A Centralized Hub for Permissioned Actions

The Authorizations Page acts as a centralized hub for managing permissioned actions. Users can view details of incoming and outgoing authorizations pending acceptance or rejection. This feature also enables users to create authorizations for various actions such as the transfer of ticker, transfer of asset ownership, request a key to join the identity, adding relayer paying keys, assignment of portfolio custody to another identity, and more. The Authorizations Page ensures secure and streamlined management of permissioned actions within the Polymesh ecosystem.

### Claims Page: Efficient Management of Claims

The Claims Page facilitates efficient management of account claims within the Polymesh network. Users can easily view details of all claims received or issued by their selected identity. Additionally, users have the capability to create claims that can be used with asset compliance rules to enforce on-chain transfer restrictions. Claims can be scoped to a specific asset, identities, or custom designation, allowing asset issuers the possibility to unlock the full capabilities of the comprehensive Polymesh on-chain compliance rules. The Claims Page offers a user-friendly interface to manage claims effectively.

### Distributions Page: Easy Access to Capital Distributions

Accessing and managing capital distributions is effortless with the Distributions Page. Users can view details of pending distributions, claim distributions, and review historical distributions. This functionality ensures that users can efficiently track and manage their capital distributions within the Polymesh ecosystem.

### Settings Page: Customization and Configuration Options

The Settings Page allows users to tailor their experience according to their preferences. Users can change their connected wallet, set a default address for loading upon connection, block specific wallets from appearing in the UI, select custom RPC endpoints and Subquery instances, switch between light and dark themes, and access information about the connected chain. This high flexibility allows for a personalized user experience.

## Join the Community and Contribute

The Polymesh Portal is an open-source project, and we wholeheartedly welcome contributions and feedback from the community, whether through bug reports, feature requests, or pull requests. Please follow us on [Twitter](https://twitter.com/PolymeshNetwork) and join the active community on [Discord](https://discord.gg/9TdzKbKgSU). Together, let's unlock the true potential of the Polymesh ecosystem!

### Installation

To install and set up the Polymesh Portal, follow the steps below:

1. Clone the repository to your local machine:

   ```shell
   git clone https://github.com/PolymeshAssociation/polymesh-portal.git
   ```

2. Navigate to the project directory

   ```shell
   cd polymesh-portal
   ```

3. Install the necessary dependencies using Yarn:

   ```shell
   yarn
   ```

### Configuration

The Polymesh Portal uses environment variables to configure node and middleware endpoints, as well as other external URLs. By default, the Testnet configuration can be found in the `.env.development file`. When running a local development server, this file is used by default. However, when building for production, you should use the `.env.production` file to configure the environment variables. Additionally, you can change the runtime node and middleware endpoints via the website's `Settings` page.

### Local Development

To run the Polymesh Portal locally for development purposes, use the following command:

```shell
yarn dev
```

This command starts a local development server and exposes the host for testing with other devices on the same network. Any changes you make to the code will be reflected live without the need to restart the server.

### Build

To generate the static content that can be served using any static content hosting service, run the following command:

```shell
yarn build
```

This command generates the static content into the dist directory. You can then deploy the contents of the `dist` directory to a hosting service of your choice.
