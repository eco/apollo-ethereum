import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  printSchema,
  GraphQLFieldConfigMap,
  GraphQLBoolean,
  GraphQLScalarType,
  GraphQLFieldConfigArgumentMap,
} from 'graphql'
import { ReqAbiItem } from './interfaces'
import { solidityToGraph } from './types'
import { isQueryItem, isMutationItem } from './predicates'

interface AbiMap {
  [contractName: string]: ReqAbiItem[]
}

const addressType: GraphQLScalarType = solidityToGraph('address').type

export default (abiMap: AbiMap): string => {
  const queryContractFields: GraphQLFieldConfigMap<null, null> = {}
  const mutationContractFields: GraphQLFieldConfigMap<null, null> = {}

  Object.entries(abiMap).forEach(([contractName, abi]) => {
    const queryFields: GraphQLFieldConfigMap<null, null> = {}
    const mutationFields: GraphQLFieldConfigMap<null, null> = {}

    abi.forEach(item => {
      if (!(isQueryItem(item) || isMutationItem(item))) {
        return
      }

      // field args
      const args: GraphQLFieldConfigArgumentMap = {}
      item.inputs.forEach(input => {
        const { type } = solidityToGraph(input.type)
        args[input.name] = { type: new GraphQLNonNull(type) }
      })

      // field type
      let type = GraphQLBoolean
      if (item.outputs[0]) {
        type = solidityToGraph(item.outputs[0].type).type
      }

      const fieldConfig = isQueryItem(item) ? queryFields : mutationFields
      fieldConfig[item.name] = { type, args }
    })

    // contract args
    const contractArgs = {
      address: {
        type: new GraphQLNonNull(addressType),
      },
    }

    // contract types
    if (Object.keys(queryFields).length) {
      queryFields._address = { type: new GraphQLNonNull(addressType) }
      queryContractFields[contractName] = {
        type: new GraphQLObjectType({
          name: contractName,
          fields: queryFields,
        }),
        args: contractArgs,
      }
    }
    if (Object.keys(mutationFields).length) {
      mutationContractFields[contractName] = {
        type: new GraphQLObjectType({
          name: `${contractName}Mutative`,
          fields: mutationFields,
        }),
        args: contractArgs,
      }
    }
  })

  const query = new GraphQLObjectType({
    name: 'Query',
    fields: queryContractFields,
  })

  const mutation = Object.keys(mutationContractFields).length
    ? new GraphQLObjectType({
        name: 'Mutation',
        fields: mutationContractFields,
      })
    : null

  const schema = new GraphQLSchema({ query, mutation })

  return printSchema(schema)
}
