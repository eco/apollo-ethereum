import { GraphQLList, GraphQLInputObjectType, GraphQLObjectType } from 'graphql'
import { AbiInput, AbiOutput } from 'web3-utils'
import { CachedDefine, SolidityToGraphIO } from '../interfaces'
import { solidityToGraphScalar } from './graph-scalar'

const structToTypeName = (str: string) =>
  str.replace('struct ', '').replace('.', '_')

// @ts-ignore
export const solidityToGraphIO: SolidityToGraphIO = (
  solidity: AbiInput | AbiOutput,
  contractName: string,
  defineType: CachedDefine,
  isInput?: boolean
) => {
  if (solidity.type !== 'tuple') {
    // scalar or list type
    const { type, isArray } = solidityToGraphScalar(solidity.type)
    return isArray ? new GraphQLList(type) : type
  }

  let name = structToTypeName((solidity as any).internalType)
  if (isInput) {
    name = `${name}_Input`
  }

  return defineType(name, () => {
    const fields: any = {}
    if (solidity.components) {
      solidity.components.forEach((component: AbiInput) => {
        fields[component.name] = {
          type: solidityToGraphIO(component, contractName, defineType, isInput),
        }
      })
    }
    return isInput
      ? new GraphQLInputObjectType({ name, fields })
      : new GraphQLObjectType({ name, fields })
  })
}
