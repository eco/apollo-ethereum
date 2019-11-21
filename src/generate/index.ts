import {
  GraphQLSchema,
  GraphQLObjectType,
  printSchema,
  GraphQLFieldConfigMap,
  GraphQLBoolean,
  GraphQLScalarType,
  GraphQLFieldConfigArgumentMap,
  GraphQLList,
  GraphQLType,
  GraphQLNonNull,
} from 'graphql'
import { ReqAbiItem } from './interfaces'
import { solidityToGraph } from './types'
import { isQueryItem, isMutationItem } from './predicates'

interface AbiMap {
  [contractName: string]: ReqAbiItem[]
}
type Fields = GraphQLFieldConfigMap<null, null>
type SolidityToGraphOutput = (
  solidityType: string
) => GraphQLScalarType | GraphQLList<any>

const addressType: GraphQLScalarType = solidityToGraph('address').type

const solidityToGraphOutput: SolidityToGraphOutput = solidityType => {
  const { type, isArray } = solidityToGraph(solidityType)
  return isArray ? new GraphQLList(type) : type
}

export default (abiMap: AbiMap): string => {
  const queryContractFields: Fields = {}
  const mutationContractFields: Fields = {}

  Object.entries(abiMap).forEach(([contractName, abi]) => {
    const queryFields: Fields = {}
    const mutationFields: Fields = {}

    abi
      .filter(item => isQueryItem(item) || isMutationItem(item))
      .forEach(item => {
        // field args
        const args: GraphQLFieldConfigArgumentMap = {}
        item.inputs.forEach(input => {
          const type = solidityToGraphOutput(input.type)
          args[input.name || 'key'] = { type: new GraphQLNonNull(type) }
        })

        // field type
        let type: GraphQLType = GraphQLBoolean
        if (item.outputs[0]) {
          type = solidityToGraphOutput(item.outputs[0].type)
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
      queryFields._address = { type: addressType }
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
