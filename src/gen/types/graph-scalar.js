import {
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
  GraphQLScalarType,
} from 'graphql'

const reType = /^([a-z]+)(\d+)?$/

/**
 * GraphQL Scalars
 */
const Bytes = new GraphQLScalarType({
  name: 'Bytes',
  serialize: value => value,
})

const BigNumber = new GraphQLScalarType({
  name: 'BigNumber',
  serialize: value => value,
})

export const Address = new GraphQLScalarType({
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
  bytes: Bytes,
  int: resolveInt,
  uint: resolveInt,
}

/**
 * Converts a solidity type string into a GraphQLScalar type
 */
export const solidityToGraphScalar = solidityType => {
  const match = solidityType.match(reType)
  if (!match) {
    throw new Error(`Did not match solidity type syntax: ${solidityType}`)
  }
  const [baseType, size] = match.slice(1)

  const resolver = typeMap[baseType]
  if (!resolver) {
    throw new Error(`No resolver found for solidity type: ${baseType}`)
  }
  const graphType =
    typeof resolver === 'function' ? resolver(parseInt(size)) : resolver

  return graphType
}
