# What is apollo-ethereum?

`apollo-ethereum` is the missing link between on-chain contract data and your dApp. It allows you to express your data requirements in declarative GraphQL, while handling data retrieval and common behaviours for you. The result is simplified access to the Ethereum network, and significantly reduced frontend application logic.

### Example

Given the following contract:

```solidity
pragma solidity >=0.4.21 <0.6.0;

contract SimpleStorage {
  uint256 storedData = 42;

  function set(uint256 x) public {
    storedData = x;
  }

  function get() public view returns (uint256) {
    return storedData;
  }
}
```

At build-time, `apollo-ethereum` will generate the GraphQL Schema:

```graphql
type Mutation {
  SimpleStorage(address: Address!): SimpleStorageMutative
}

type Query {
  SimpleStorage(address: Address!): SimpleStorage
}

type SimpleStorage {
  _address: Address
  get: BigNumber
}

type SimpleStorageMutative {
  set(x: BigNumber): Boolean
}
```

You may then import the generated schema (and associated contract ABIs) into your app, to run queries and mutations against Ethereum using GraphQL syntax. For example, you might call the set method using the following GraphQL query:

```graphql
mutation($value: BigNumber!) {
  SimpleStorage(address: "0x123...") {
    set(x: $value)
  }
}
```

Calls to Ethereum (via the configured web3 provider) will occur automatically, and you may code against loading and error states as per standard Apollo GraphQL client behaviour.

## Installation

`apollo-ethereum` includes both build-time and runtime modules, therefore it must be installed as a production dependency using either:

```
yarn add apollo-ethereum
```

or

```
npm install apollo-ethereum --save
```

## Usage

### Building the graphql schema

The `apollo-ethereum` binary is responsible for converting a folder of compiled Solidity contracts into the final GraphQL schema. First, ensure your contracts have been compiled into a build folder, then:

1. Create a configuration file

In the root of your project, create a file named `eth.config.yaml`. Add an entry for each contract you wish to include in the generated schema. A minimal configuration file might look like the folllowing:

```yaml
contracts:
  SimpleStorage: true
```

_NB: See further below for Features which allow you to configure the schema output and behaviour for each contract_

2. Run the schema generated

The included binary accepts input in the form of:

```
apollo-ethereum [contracts_dir] [output_dir]
```

This script will place two new files in the output dir, a `index.js` configuration module to be included in your runtime build, and a superfluous `ethereum.graphql` schema file which is not required, but may be used by various GraphQL tools to implement tooling - such as linting application queries, or generting TypeScript types for use with your application. _Note: Recipes for these tasks will be available shortly._

### Configuring the Apollo GraphQL client

Apollo Client is agnostic to the frontend framework in-use, therefore only the base client configuration instructions are provided. For integrating your framework with Apollo Client, see the documentation for your relevant binding library e.g. (`react-apollo`)[https://www.npmjs.com/package/react-apollo]

In the following example code, `graph` is the name of the output directory.

```js
import { ApolloClient } from 'apollo-client'
import { createEthereumLink } from 'apollo-ethereum'
import { InMemoryCache } from 'apollo-cache-inmemory'
import ethereumConfig from './graph'

const link = createEthereumLink(ethereumConfig, {
  provider: window.ethereum,
  // additional feature configuration (see below)
})
const cache = new InMemoryCache()
const client = new ApolloClient({ link, cache })
```
