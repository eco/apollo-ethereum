import { GraphQLBoolean, GraphQLString } from 'graphql'
import * as scalars from '../../shared/scalars'

const reType = /^([a-z]+)(\d+)?$/

/**
 * Type Resolvers
 */
const resolveInt = size => {
  return size && size <= 48 ? scalars.Int : scalars.BigNumber
}

const typeMap = {
  address: scalars.Address,
  bool: GraphQLBoolean,
  string: GraphQLString,
  bytes: scalars.Bytes,
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
