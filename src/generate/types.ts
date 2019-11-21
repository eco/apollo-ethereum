import {
  GraphQLScalarType,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
} from 'graphql'

/**
 * TypeScript Types
 */
type TypeResolver = (size: number) => GraphQLScalarType
interface TypeMap {
  [typeName: string]: GraphQLScalarType | TypeResolver
}
interface GraphResult {
  type: GraphQLScalarType
  isArray: boolean
}
type SolidityToGraph = (solidityType: string) => GraphResult

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

const typeMap: TypeMap = {
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
export const solidityToGraph: SolidityToGraph = solidityType => {
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
