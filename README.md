# What is apollo-ethereum?

`apollo-ethereum` is the missing link between on-chain contract data and your dApp. It allows you to express your data requirements in declarative GraphQL, while handling data retrieval and common behaviours for you. The result is simplified access to the Ethereum network, and significantly reduced frontend application logic.

[Installation](#install) | [Usage](#usage) | [Features](#features)

### Example

Given the following contract:

```solidity
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

<a name="install"></a>

# Installation

`apollo-ethereum` includes both build-time and runtime modules, therefore it must be installed as a production dependency using either:

```
yarn add apollo-ethereum
```

or

```
npm install apollo-ethereum --save
```

<a name="usage"></a>

# Usage

## Building the GraphQL schema

The `apollo-ethereum` binary is responsible for converting a folder of compiled Solidity contracts into the final GraphQL schema. First, ensure your contracts have been compiled into a build folder, then:

### 1. Create a configuration file

In the root of your project, create a file named `eth.config.yaml`. Add an entry for each contract you wish to include in the generated schema. A minimal configuration file might look like the folllowing:

```yaml
contracts:
  SimpleStorage: true
```

_NB: See further below for Features which allow you to configure the schema output and behaviour for each contract_

### 2. Run the schema generator

The included binary accepts input in the form of:

```
apollo-ethereum [contracts_dir] [output_dir]
```

This script will place two new files in the output dir:

1. **`index.js`** - configuration module to be included in your runtime build
2. **`ethereum.graphql`** - a superfluous schema file which is not required, but may be used by various GraphQL tools to implement additional GraphQL-related tooling. For example, query linting or generating types for use with your application. _Note: Recipes for these tasks will be available shortly._

## Configuring the Apollo GraphQL client

> Apollo Client is agnostic to the frontend framework in-use, therefore only the base client configuration instructions are provided. For integrating your framework with Apollo Client, see the documentation for your relevant binding library e.g. [`react-apollo`](https://www.npmjs.com/package/react-apollo)

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

<a name="features"></a>

# Features

To see these features in action, refer to the `tests` directory.

## ERC1820 interface address registry

If you notice in all examples of this readme, the generated schema requires an address to be provided for the requested contract. However, if the contract is registered with an ERC1820 registry, and you know the interface name of the contract, you are able to skip the provision of a hard-coded address and allow `apollo-ethereum` to lookup the contract's address automatically. You can update the config YAML with the contracts interface name as follows:

```yaml
contracts:
  MyERC20Token:
    interfaceName: ERC20
```

This will make the `address` argument **optional** for the given contract, allowing you to perform a query without hard-coding an address:

```graphql
query {
  MyERC20Token {
    symbol
    decimals
  }
}
```

To enable this piece of functionality, you must provide the registry address and lookup function method name when instantiating the Apollo Link, e.g.

```js
const link = createEthereumLink(ethereumConfig, {
  provider: ethereum,
  erc1820: {
    lookupAddress: process.env.ERC1820_ADDR,
    lookupMethod: 'policyFor',
  }
})
```

## Type conversion

The schema generation process makes use of both the contract ABI and AST to determine input and output types, however there may be some scenarios where a more suitable type can be selected. For example, a date stored as `uint256`, or perhaps the contract is storing an `int256` value that can be safely converted to a JavaScript-native number without requiring the use of the BigNumber library.

The config YAML allows you to specify type overrides for output fields. You may choose from built-in GraphQL types (`String`, `Int`, etc) or scalar types that come bundled with `apollo-ethereum`, listed as follows:

* `Bytes`
* `Address`
* `BigNumber`
* `Timestamp`

BigNumber and Timestamp will return deserialized data in the appropriate data structure (BigNumber and Date respectively).

### Contract source

```solidity
contract Coercion {
  /* uint to Int */
  uint256 public smallInteger = 2048;

  /* uint to Timestamp */
  uint256 public createdAt = now;
}

```

### eth.config.yaml

```yaml
contracts:
  Coercion:
    fields:
      smallInteger: Int
      createdAt: Timestamp
```

### Generated schema

```graphql
type Coercion {
  _address: Address
  createdAt: Timestamp
  smallInteger: Int
}
```

### Example query

```graphql
query {
  Coercion(address: "0x123...") {
    createdAt # returns an instance of JS-native Date
    smallInteger # converts the BigNumber into a JS-native Number
  }
}
```

## Mappings and arrays

When mapping and array state variables are compiled, each entry in the mapping or array must be accessed individually, using either a key (mapping) or index (array). For arrays, you may be able to create a function that returns an array of all members, as long as the array members are a primitive type.

### Contract source

```solidity
contract Types {
  uint8[] public ints = [1, 2, 3, 4, 5];

  mapping(bytes3 => uint256) public tlaScore;

  function allInts() public view returns (uint8[] memory) {
    return ints;
  }
}
```

### eth.config.yaml

The schema generation process handles this automatically - no additional configuration is required.

### Generated schema

```graphql
type Types {
  _address: Address
  ints(index: BigNumber!): Int
  tlaScore(key: Bytes!): BigNumber
  allInts: [Int]
}
```

### Example query

```graphql
query {
  Types(address: "0x123...") {
    ints(index: 1) # returns second member of array
    tlaScore(key: "tla") # returns BigNumber located at given key of mapping
    allInts # returns an array of all integers
  }
}
```

## Mapping index pattern

A common task in querying a contract mapping is attempting to return all known members of a mapping data structure. To attempt to retrieve each individually would likely result in first retrieving the known keys for a mapping, then asynchronously iterating through each known key to retrieve the associated member. Thankfully `apollo-ethereum` provides a quick & convenient way to retrieve many members of a mapping, using the "mapping index" pattern. A mapping index is an array containing known keys for a mapping, which can be used to retrieve the associated mapping entry for each key.

### Contract source

```solidity
contract Index {
  struct Profile {
    string name;
    string email;
  }

  /* the mapping */
  mapping(address => Profile) public profiles;

  /* the mapping index */
  address[] _profilesIndex;

  function addProfile(address _addr, string memory _name, string memory _email) public {
    profiles[_addr] = Profile(_name, _email);
    _profilesIndex.push(_addr);
  }
}
```

### eth.config.yaml


```yaml
contracts:
  Index:
    fields:
      allProfiles:
        mappingIndex: profiles
```

### Generated schema

```graphql
type Index {
  _address: Address
  profiles(key: Address!): Index_Profile
  allProfiles: [Index_allProfiles] @mappingIndex(mapping: "profiles")
}

type Index_allProfiles {
  key: Address
  value: Index_Profile
}

type Index_Profile {
  name: String
  email: String
}
```

### Example query

To retrieve all profiles in the mapping:

```graphql
query {
  Index(address: "0x123...") {
    allProfiles {
      key
      value {
        name
        email
      }
    }
  }
}
```

## Contracts using `selfdestruct`

Contracts which make use of `selfdestruct` cannot have state variables queried after they have been destroyed. The only pieces of contract data which remain available after their destruction are the events produced during active state on the Ethereum network. `apollo-ethereum` allows you to configure a `selfdestruct` contract and produces two types during generation - one representing a contract "active" state, and another representing the same contract after it has been destroyed, otherwise known as the "complete" state.

### Contract source

```solidity
contract SelfDestruct {
  string public message = "only available on active contracts";

  event Log(string message);

  constructor() public {
    emit Log("Creating the contract");
  }

  function destroy() public {
    emit Log("Destroying the contract");
    selfdestruct(msg.sender);
  }
}
```

### eth.config.yaml

```yaml
contracts:
  SelfDestruct:
    canSelfDestruct: true
```

### Generated schema

```graphql
type Mutation {
  SelfDestruct(address: Address!): SelfDestructMutative
}

type Query {
  SelfDestruct(address: Address!): SelfDestruct
}

interface SelfDestruct {
  _address: Address
  Log: [SelfDestruct_Log]
}

type SelfDestruct_Log {
  message: String
  _timestamp: Timestamp
}

type SelfDestructActive implements SelfDestruct {
  _address: Address
  Log: [SelfDestruct_Log]
  integer: Int
  message: String
}

type SelfDestructComplete implements SelfDestruct {
  _address: Address
  Log: [SelfDestruct_Log]
}

type SelfDestructMutative {
  destroy: Boolean
}
```

### Example query

Notice the use of a [fragment](https://graphql.org/learn/queries/#fragments) to specify which fields should be queried, only when the contract is still active on the chain. Using this syntax ensures that the requested data is only fetched from the chain if the contract has not yet self-destructed.

Additionally, you may want to make use of the GraphQL-level field `__typename` to determine whether the contract at the given address is active or not. It will return a string set to either `'<CONTRACT_NAME>Active'` or `'<CONTRACT_NAME>Complete'`.

```graphql
query {
  SelfDestruct(address: "0x123...") {
    __typename
    _address
    Log {
      _timestamp
      message
    }
    ... on SelfDestructActive {
      message
    }
  }
}
```

## Contract relationships

By far, the most helpful feature of `apollo-ethereum` is the ability to model relationships between contracts. A common pattern seen in Ethereum is storing the address of Contract B in the state data of Contract A. In this scenario, we have a relationship between both contracts that is well-suited for GraphQL modeling.

### Contract source

**Car.sol**

```solidity
contract Car {
  string public name;

  address[] public reviews;

  constructor(string memory _name) public {
    name = _name;
  }

  function addReview(address _address) public {
    reviews.push(_address);
  }

  function allReviews() public view returns (address[] memory) {
    return reviews;
  }
}
```

**CarReview.sol**

```solidity
contract CarReview {
  enum Rating { Bad, Good }

  Rating public rating;
  string public review;

  constructor(Rating _rating, string memory _review) public {
    rating = _rating;
    review = _review;
  }
}

```

### eth.config.yaml

We can create a one-to-many link from Car to CarReview, using the following configuration in `eth.config.yaml` (making use of type overrides, as demonstrated above):

```yaml
contracts:
  CarReview: true
  Car:
    fields:
      reviews: CarReview
      allReviews: CarReview
```

### Generated schema

This will produce the following GraphQL schema, giving you the ability to reach through contract relationships, and fetch data from related contracts in a single query.

```graphql
type Car {
  _address: Address
  name: String
  reviews(index: BigNumber!): CarReview @contract
  allReviews: [CarReview] @contract
}

type CarMutative {
  addReview(address: Address): Boolean
}

type CarReview {
  _address: Address
  rating: CarReview_Rating
  review: String
}

enum CarReview_Rating {
  Bad
  Good
}

type Mutation {
  Car(address: Address!): CarMutative
}

type Query {
  Car(address: Address!): Car
  CarReview(address: Address!): CarReview
}
```

### Example query

```graphql
query {
  Car(address: "0x123...") {
    _address
    name
    allReviews {
      _address
      rating
      review
    }
  }
}
```

# Contributing

PRs accepted.

# License

MIT © Eco
