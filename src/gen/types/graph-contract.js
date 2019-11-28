import { GraphQLObjectType } from 'graphql'
import { isQueryItem, isMutationItem } from '../predicates'
import { Address } from './graph-scalar'

export const solidityToGraphContract = (
  contractName,
  abi,
  graphTypeFromAst
) => {
  const queryFields = {}
  const mutationFields = {}

  abi
    .filter(item => isQueryItem(item) || isMutationItem(item))
    .forEach(item => {
      const fieldConfig = graphTypeFromAst(item.name)
      if (isQueryItem(item)) {
        queryFields[item.name] = fieldConfig
      } else {
        mutationFields[item.name] = fieldConfig
      }
    })

  // schema query type
  queryFields._address = { type: Address }
  const queryType = new GraphQLObjectType({
    name: contractName,
    fields: queryFields,
  })

  // schema mutation type
  let mutationType
  if (Object.keys(mutationFields).length) {
    mutationType = new GraphQLObjectType({
      name: `${contractName}Mutative`,
      fields: mutationFields,
    })
  }

  return {
    query: queryType,
    mutative: mutationType,
  }
}
