import {
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
  GraphQLScalarType,
} from 'graphql'

/**
 * GraphQL Scalars
 */
const BigNumber = new GraphQLScalarType({
  name: 'BigNumber',
  serialize: value => value,
})

const Address = new GraphQLScalarType({
  name: 'Address',
  serialize: value => value.toString(),
})

export const Timestamp = new GraphQLScalarType({
  name: 'Timestamp',
  serialize: value => parseInt(value) * 1000,
  parseValue: value => new Date(value),
})

/**
 * Type Resolvers
 */
const resolveInt = size => {
  return size && size <= 48 ? GraphQLInt : BigNumber
}

const typeMap = {
  address: Address,
  bool: GraphQLBoolean,
  string: GraphQLString,
  bytes: GraphQLString,
  int: resolveInt,
  uint: resolveInt,
}

/**
 * Converts a solidity type string into a GraphQLScalar type
 */
export const solidityToGraphScalar = (solidityType, size) => {
  const resolver = typeMap[solidityType]
  if (!resolver) {
    throw new Error(`No resolver found for solidity type: ${solidityType}`)
  }
  const graphType = typeof resolver === 'function' ? resolver(size) : resolver

  return graphType
}
