import { GraphQLObjectType, GraphQLInterfaceType } from 'graphql'
import { isQueryItem, isMutationItem } from '../predicates'
import { Address } from '../../shared/scalars'

export const solidityToGraphContract = (
  contractName,
  abi,
  graphTypeFromAst,
  canSelfDestruct
) => {
  const queryFieldsTemporal = {}
  const queryFieldsPersistent = { _address: { type: Address } }
  const writeFields = {}
  const impl = []

  abi
    .filter(item => isQueryItem(item) || isMutationItem(item))
    .forEach(item => {
      const fieldConfig = graphTypeFromAst(item.name)
      if (isQueryItem(item)) {
        if (item.type === 'event') {
          queryFieldsPersistent[item.name] = fieldConfig
        } else {
          queryFieldsTemporal[item.name] = fieldConfig
        }
      } else {
        writeFields[item.name] = fieldConfig
      }
    })

  // schema query type
  let queryType
  if (canSelfDestruct) {
    queryType = new GraphQLInterfaceType({
      name: contractName,
      fields: queryFieldsPersistent,
    })
    const activeType = new GraphQLObjectType({
      name: `${contractName}Active`,
      interfaces: [queryType],
      fields: { ...queryFieldsPersistent, ...queryFieldsTemporal },
    })
    const completeType = new GraphQLObjectType({
      name: `${contractName}Complete`,
      interfaces: [queryType],
      fields: queryFieldsPersistent,
    })
    impl.push(activeType, completeType)
  } else {
    queryType = new GraphQLObjectType({
      name: contractName,
      fields: { ...queryFieldsPersistent, ...queryFieldsTemporal },
    })
  }

  // schema mutation type
  let mutationType
  if (Object.keys(writeFields).length) {
    mutationType = new GraphQLObjectType({
      name: `${contractName}Mutative`,
      fields: writeFields,
    })
  }

  return {
    query: queryType,
    mutative: mutationType,
    impl,
  }
}
