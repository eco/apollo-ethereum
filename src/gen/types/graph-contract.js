import { GraphQLObjectType, GraphQLBoolean, GraphQLList } from 'graphql'
import { isQueryItem, isMutationItem } from '../predicates'
import { solidityToGraphIO, solidityToGraphIOField } from './graph-io'
import { Timestamp, solidityToGraphScalar } from './graph-scalar'

const addressType = solidityToGraphScalar('address')

export const solidityToGraphContract = (contractName, abi, defineType) => {
  const queryFields = {}
  const mutationFields = {}

  const io = (items, isInput) => solidityToGraphIO(items, defineType, isInput)

  const field = item => solidityToGraphIOField(item, defineType)

  abi
    .filter(item => isQueryItem(item) || isMutationItem(item))
    .forEach(item => {
      if (item.type === 'event') {
        const type = defineType(item.name, name => {
          const fields = io(item.inputs, false)
          fields._timestamp = { type: Timestamp }
          return new GraphQLObjectType({ name, fields })
        })
        queryFields[item.name] = { type: new GraphQLList(type) }
      } else {
        // input
        const args = io(item.inputs, true)

        // output
        let type
        if (!item.outputs.length) {
          type = GraphQLBoolean
        } else if (item.outputs.length === 1) {
          type = field(item.outputs[0])
        } else {
          type = defineType(item.name, name => {
            const fields = io(item.outputs)
            return new GraphQLObjectType({ name, fields })
          })
        }

        // add field to config map
        const fieldConfig = isQueryItem(item) ? queryFields : mutationFields
        fieldConfig[item.name] = { type, args }
      }
    })

  // schema query type
  queryFields._address = { type: addressType }
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
