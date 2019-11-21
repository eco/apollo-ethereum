import {
  GraphQLSchema,
  GraphQLObjectType,
  printSchema,
  GraphQLFieldConfigMap,
  GraphQLBoolean,
  GraphQLScalarType,
  GraphQLFieldConfigArgumentMap,
  GraphQLType,
  GraphQLNonNull,
} from 'graphql'
import { ReqAbiItem } from './interfaces'
import { solidityToGraph, solidityToGraphScalar } from './types'
import { isQueryItem, isMutationItem } from './predicates'

interface AbiMap {
  [contractName: string]: ReqAbiItem[]
}
type Fields = GraphQLFieldConfigMap<null, null>

const addressType: GraphQLScalarType = solidityToGraphScalar('address').type

const normalizeName = (str: string) => str.replace(/^_+/, '') || 'key'

export default (abiMap: AbiMap): string => {
  const queryContractFields: Fields = {}
  const mutationContractFields: Fields = {}

  Object.entries(abiMap).forEach(([contractName, abi]) => {
    const queryFields: Fields = {}
    const mutationFields: Fields = {}

    abi
      .filter(item => isQueryItem(item) || isMutationItem(item))
      .forEach(item => {
        // field input
        const args: GraphQLFieldConfigArgumentMap = {}
        item.inputs.forEach(input => {
          const argName = normalizeName(input.name)
          const inputType = solidityToGraph(input, contractName, true)
          args[argName] = { type: new GraphQLNonNull(inputType) }
        })

        // field output
        let type: GraphQLType
        if (!item.outputs.length) {
          type = GraphQLBoolean
        } else if (item.outputs.length === 1) {
          type = solidityToGraph(item.outputs[0], contractName)
        } else {
          const outputFields: Fields = {}
          item.outputs.forEach(output => {
            const fieldName = normalizeName(output.name)
            const outputType = solidityToGraph(output, contractName)
            outputFields[fieldName] = { type: outputType }
          })
          type = new GraphQLObjectType({
            name: `${contractName}_${item.name}`,
            fields: outputFields,
          })
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
    queryFields._address = { type: addressType }
    queryContractFields[contractName] = {
      type: new GraphQLObjectType({
        name: contractName,
        fields: queryFields,
      }),
      args: contractArgs,
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

  let mutation
  if (Object.keys(mutationContractFields).length) {
    mutation = new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationContractFields,
    })
  }

  const schema = new GraphQLSchema({ query, mutation })

  return printSchema(schema)
}
