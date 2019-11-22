import {
  GraphQLSchema,
  GraphQLObjectType,
  printSchema,
  GraphQLNonNull,
} from 'graphql'
import { AbiMap, Fields, TypeMap, CachedDefine } from './interfaces'
import { solidityToGraphContract } from './types/graph-contract'
import { solidityToGraphScalar } from './types/graph-scalar'

export default (abiMap: AbiMap): string => {
  const queryFields: Fields = {}
  const mutationFields: Fields = {}

  const typeMap: TypeMap = {}
  // @ts-ignore
  const defineType: CachedDefine = (key, define) => {
    if (!typeMap[key]) {
      typeMap[key] = define(key)
    }
    return typeMap[key]
  }

  Object.entries(abiMap).forEach(([contractName, abi]) => {
    const addressType = solidityToGraphScalar('address')
    const args = {
      address: {
        type: new GraphQLNonNull(addressType),
      },
    }

    const { query, mutative } = solidityToGraphContract(
      contractName,
      abi,
      defineType
    )

    queryFields[contractName] = { type: query, args }
    if (mutative) {
      mutationFields[contractName] = { type: mutative, args }
    }
  })

  const query = new GraphQLObjectType({
    name: 'Query',
    fields: queryFields,
  })

  let mutation
  if (Object.keys(mutationFields).length) {
    mutation = new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationFields,
    })
  }

  const schema = new GraphQLSchema({ query, mutation })

  return printSchema(schema)
}
