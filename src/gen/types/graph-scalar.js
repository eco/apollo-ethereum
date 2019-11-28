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
const serialize = value => value
const createScalarType = name => new GraphQLScalarType({ name, serialize })
const Bytes = createScalarType('Bytes')
const BigNumber = createScalarType('BigNumber')
const Address = createScalarType('Address')
const Timestamp = createScalarType('Timestamp')

export { Address, Timestamp }

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
