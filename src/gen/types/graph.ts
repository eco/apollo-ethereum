import { solidityToGraphScalar } from './graph-scalar'

import {
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLInputFieldConfigMap,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLObjectType,
  GraphQLFieldConfigMap,
} from 'graphql'
import { AbiInput, AbiOutput } from 'web3-utils'

type Fields = GraphQLFieldConfigMap<null, null>
interface SolidityToGraph {
  (input: AbiInput, contractName: string, isInput?: boolean): GraphQLInputType
  (
    output: AbiOutput,
    contractName: string,
    isInput?: boolean
  ): GraphQLOutputType
}

// @ts-ignore
export const solidityToGraph: SolidityToGraph = (
  solidity: AbiInput | AbiOutput,
  contractName: string,
  isInput?: boolean
) => {
  if (solidity.type === 'tuple') {
    const name = `${contractName}_${solidity.name}`
    if (isInput) {
      const fields: GraphQLInputFieldConfigMap = {}
      if (solidity.components) {
        solidity.components.forEach((component: AbiInput) => {
          fields[component.name] = {
            type: solidityToGraph(component, contractName, isInput),
          }
        })
      }
      return new GraphQLInputObjectType({ name, fields })
    } else {
      const fields: Fields = {}
      if (solidity.components) {
        solidity.components.forEach((component: AbiOutput) => {
          fields[component.name] = {
            type: solidityToGraph(component, contractName, isInput),
          }
        })
      }
      return new GraphQLObjectType({ name, fields })
    }
  }

  const { type, isArray } = solidityToGraphScalar(solidity.type)
  return isArray ? new GraphQLList(type) : type
}
