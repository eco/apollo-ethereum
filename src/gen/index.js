import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLDirective,
  GraphQLString,
} from 'graphql'
import { solidityToGraphContract } from './types/graph-contract'
import * as scalars from '../shared/scalars'
import { graphTypeFromAst } from './ast-mapping'
import { applyFieldConfig } from './fields'
import { printSchema } from './print'

export default contractMap => {
  const queryFields = {}
  const mutationFields = {}

  const typeMap = {}
  const defineType = (key, define) => {
    if (!typeMap[key]) {
      typeMap[key] = define(key)
    }
    return typeMap[key]
  }

  const types = []

  Object.entries(contractMap).forEach(([contractName, contract]) => {
    const { abi, ast, config } = contract

    // generate the graphql objects for the contract - one for queries
    // and the other for mutations
    const contractNode = ast.nodes.find(
      node => node.nodeType === 'ContractDefinition'
    )
    const defineContractType = (name, define) =>
      defineType(`${contractName}_${name}`, define)

    const { query, mutative, impl } = solidityToGraphContract(
      contractName,
      abi,
      itemName => graphTypeFromAst(contractNode, itemName, defineContractType),
      config
    )
    types.push(...impl)

    // apply type overrides
    if (config.fields) {
      applyFieldConfig(impl.concat(query), config.fields, contractName)
    }

    // build top-level query and mutation fields from the respective contract types
    const contractAddressType = config.interfaceName
      ? scalars.Address
      : new GraphQLNonNull(scalars.Address)

    const contractArgs = {
      address: {
        type: contractAddressType,
      },
    }
    const extensions = {}
    if (config.interfaceName) {
      extensions.directives = {
        erc1820: { interfaceName: config.interfaceName },
      }
    }

    query.description = contractNode.documentation
    queryFields[contractName] = { type: query, args: contractArgs, extensions }

    if (mutative) {
      mutative.description = contractNode.documentation
      mutationFields[contractName] = {
        type: mutative,
        args: contractArgs,
        extensions,
      }
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

  const schema = new GraphQLSchema({
    query,
    mutation,
    types,
    directives: [
      new GraphQLDirective({
        name: 'erc1820',
        locations: ['FIELD_DEFINITION'],
        args: {
          interfaceName: { type: GraphQLString },
        },
      }),
      new GraphQLDirective({
        name: 'mappingIndex',
        locations: ['FIELD_DEFINITION'],
        args: {
          mapping: { type: GraphQLString },
        },
      }),
    ],
  })

  return printSchema(schema)
}
