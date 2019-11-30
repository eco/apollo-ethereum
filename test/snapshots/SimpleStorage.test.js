// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`Contract: SimpleStorage generates graphql schema 1`] = `
"scalar Address

scalar BigNumber

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
"
`