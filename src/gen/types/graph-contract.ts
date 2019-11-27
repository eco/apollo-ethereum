import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLOutputType,
  GraphQLList,
} from 'graphql'
import {
  Fields,
  Args,
  SolidityToGraphContract,
  AbiInput,
  AbiOutput,
} from '../interfaces'
import { isQueryItem, isMutationItem } from '../predicates'
import { solidityToGraphIO, solidityToGraphIOField } from './graph-io'
import { Timestamp, solidityToGraphScalar } from './graph-scalar'

const addressType = solidityToGraphScalar('address')

export const solidityToGraphContract: SolidityToGraphContract = (
  contractName,
  abi,
  defineType
) => {
  const queryFields: Fields = {}
  const mutationFields: Fields = {}

  const io = (items: AbiInput[] | AbiOutput[], isInput?: boolean) =>
    solidityToGraphIO(items, defineType, isInput)

  const field = (item: AbiOutput) => solidityToGraphIOField(item, defineType)

  abi
    .filter(item => isQueryItem(item) || isMutationItem(item))
    .forEach(item => {
      if (item.type === 'event') {
        const type = defineType(item.name, name => {
          const fields: Fields = io(item.inputs, false) as Fields
          fields._timestamp = { type: Timestamp }
          return new GraphQLObjectType({ name, fields })
        })
        queryFields[item.name] = { type: new GraphQLList(type) }
      } else {
        // input
        const args: Args = io(item.inputs, true) as Args

        // output
        let type: GraphQLOutputType
        if (!item.outputs.length) {
          type = GraphQLBoolean
        } else if (item.outputs.length === 1) {
          type = field(item.outputs[0]) as GraphQLOutputType
        } else {
          type = defineType(item.name, name => {
            const fields: Fields = io(item.outputs) as Fields
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
