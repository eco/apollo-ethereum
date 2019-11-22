import {
  GraphQLScalarType,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
} from 'graphql'
import {
  TypeResolverMap,
  TypeResolver,
  SolidityToGraphScalar,
} from '../interfaces'

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

/**
 * Type Resolvers
 */
const resolveInt: TypeResolver = size => {
  return size <= 48 ? GraphQLInt : BigNumber
}

const typeMap: TypeResolverMap = {
  address: Address,
  bool: GraphQLBoolean,
  string: GraphQLString,
  bytes: GraphQLString,
  int: resolveInt,
  uint: resolveInt,
}

const reType = /^([a-z]+)(\d+)?(\[\d*\])?$/

/**
 * Converts a solidity type string into a GraphQLScalar type
 */
export const solidityToGraphScalar: SolidityToGraphScalar = solidityType => {
  const match = solidityType.match(reType)
  if (!match) {
    throw new Error(`Did not match solidity type syntax: ${solidityType}`)
  }
  const [baseType, size, array] = match.slice(1)
  const resolver = typeMap[baseType]
  if (!resolver) {
    throw new Error(`No resolver found for solidity type: ${solidityType}`)
  }
  const graphType =
    typeof resolver === 'function' ? resolver(parseInt(size)) : resolver
  return {
    type: graphType,
    isArray: !!array,
  }
}
