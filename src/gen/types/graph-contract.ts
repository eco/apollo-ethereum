import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLFieldConfigArgumentMap,
  GraphQLNonNull,
  GraphQLOutputType,
} from 'graphql'
import { Fields, SolidityToGraphContract } from '../interfaces'
import { isQueryItem, isMutationItem } from '../predicates'
import { solidityToGraphIO } from './graph-io'
import { solidityToGraphScalar } from './graph-scalar'

const addressType = solidityToGraphScalar('address')
const normalizeName = (str: string) => str.replace(/^_+/, '') || 'key'

export const solidityToGraphContract: SolidityToGraphContract = (
  contractName,
  abi,
  defineType
) => {
  const queryFields: Fields = {}
  const mutationFields: Fields = {}

  abi
    .filter(item => isQueryItem(item) || isMutationItem(item))
    .forEach(item => {
      // field input
      const args: GraphQLFieldConfigArgumentMap = {}
      item.inputs.forEach(input => {
        const argName = normalizeName(input.name)
        const inputType = solidityToGraphIO(
          input,
          contractName,
          defineType,
          true
        )
        args[argName] = { type: new GraphQLNonNull(inputType) }
      })

      // field output
      let type: GraphQLOutputType
      if (!item.outputs.length) {
        type = GraphQLBoolean
      } else if (item.outputs.length === 1) {
        type = solidityToGraphIO(item.outputs[0], contractName, defineType)
      } else {
        type = defineType(`${contractName}_${item.name}`, name => {
          const fields: Fields = {}
          item.outputs.forEach(output => {
            const fieldName = normalizeName(output.name)
            const outputType = solidityToGraphIO(
              output,
              contractName,
              defineType
            )
            fields[fieldName] = { type: outputType }
          })
          return new GraphQLObjectType({ name, fields })
        })
      }

      const fieldConfig = isQueryItem(item) ? queryFields : mutationFields
      fieldConfig[item.name] = { type, args }
    })

  // contract query type
  queryFields._address = { type: addressType }
  const queryType = new GraphQLObjectType({
    name: contractName,
    fields: queryFields,
  })

  // contract mutation type
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
