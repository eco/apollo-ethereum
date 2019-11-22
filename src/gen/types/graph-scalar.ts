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
  return size && size <= 48 ? GraphQLInt : BigNumber
}

const typeMap: TypeResolverMap = {
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
export const solidityToGraphScalar: SolidityToGraphScalar = (
  solidityType,
  size
) => {
  const resolver = typeMap[solidityType]
  if (!resolver) {
    throw new Error(`No resolver found for solidity type: ${solidityType}`)
  }
  const graphType = typeof resolver === 'function' ? resolver(size) : resolver

  return graphType
}
