import {
  GraphQLSchema,
  GraphQLObjectType,
  printSchema,
  GraphQLNonNull,
  getNamedType,
} from 'graphql'
import { solidityToGraphContract } from './types/graph-contract'
import * as scalars from '../shared/scalars'
import { graphTypeFromAst } from './ast-mapping'

export default (abiMap, astMap, configMap) => {
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

  Object.entries(abiMap).forEach(([contractName, abi]) => {
    const config = configMap[contractName]

    // generate the graphql objects for the contract - one for queries
    // and the other for mutations
    const ast = astMap[contractName]
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
      impl.concat(query).forEach(qType => {
        Object.keys(config.fields).forEach(path => {
          const targetField = path.split('.').reduce(
            (parentConfig, fieldName) => {
              if (!parentConfig) {
                return null
              }
              const type = getNamedType(parentConfig.type)
              return type.getFields()[fieldName]
            },
            { type: qType }
          )

          if (targetField) {
            const typeName = config.fields[path]
            targetField.type = scalars[typeName]
          }
        })
      })
    }

    // build top-level query and mutation fields from the respective contract types
    const description = contractNode.documentation
    const contractArgs = {
      address: {
        type: new GraphQLNonNull(scalars.Address),
      },
    }
    query.description = description
    queryFields[contractName] = { type: query, args: contractArgs }
    if (mutative) {
      mutative.description = description
      mutationFields[contractName] = { type: mutative, args: contractArgs }
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

  const schema = new GraphQLSchema({ query, mutation, types })

  return printSchema(schema)
}
