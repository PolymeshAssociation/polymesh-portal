# Polymesh Portal

The Polymesh Portal allows Polymesh users to manage their:  
  - identities and keys
  - portfolios
  - asset transfers
  - authorisations
  - identity claims
  - capital distributions

It is also designed to allow others to easily see how to incorporate the SDK, GraphQL and UI components to allow users to easily interact with Polymesh.

### Installation

```
$ yarn
```

### Configuration

This website is using environment variables to configure node and middleware endpoints as well as other external urls. Default configuration for Testnet use can be found in `.env.development`. In runtime node and middleware endpoints can be changed via website's `Settings` page.  

### Local Development

```
$ yarn dev
```

This command starts a local development server and exposes host for testing with other devices in same network. Changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.