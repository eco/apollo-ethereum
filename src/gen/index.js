import {
  GraphQLSchema,
  GraphQLObjectType,
  printSchema,
  GraphQLNonNull,
} from 'graphql'
import { solidityToGraphContract } from './types/graph-contract'
import { Address } from './types/graph-scalar'
import { graphTypeFromAst } from './ast-mapping'

export default (abiMap, astMap) => {
  const queryFields = {}
  const mutationFields = {}

  const typeMap = {}
  const defineType = (key, define) => {
    if (!typeMap[key]) {
      typeMap[key] = define(key)
    }
    return typeMap[key]
  }

  Object.entries(abiMap).forEach(([contractName, abi]) => {
    // generate the graphql objects for the contract - one for queries
    // and the other for mutations
    const ast = astMap[contractName]
    const contractNode = ast.nodes.find(
      node => node.nodeType === 'ContractDefinition'
    )
    const defineContractType = (name, define) =>
      defineType(`${contractName}_${name}`, define)
    const { query, mutative } = solidityToGraphContract(
      contractName,
      abi,
      itemName => graphTypeFromAst(contractNode, itemName, defineContractType)
    )

    // build top-level query and mutation fields from the respective contract types
    const description = contractNode.documentation
    const contractArgs = {
      address: {
        type: new GraphQLNonNull(Address),
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

  const schema = new GraphQLSchema({ query, mutation })

  return printSchema(schema)
}
