import {
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLType,
} from 'graphql'
import {
  CachedDefine,
  SolidityToGraphIO,
  AbiInput,
  AbiOutput,
} from '../interfaces'
import { solidityToGraphScalar } from './graph-scalar'

const reType = /^([a-z]+)(\d+)?(\[\d*\])?$/
const reStruct = /^struct ([\w.]+)(\[\d*\])?$/

const structToTypeName = (str: string) => {
  const match = str.match(reStruct)
  if (!match) {
    throw new Error(`Did not match solidity struct name: ${str}`)
  }
  return match[1].replace('.', '_')
}

// @ts-ignore
export const solidityToGraphIO: SolidityToGraphIO = (
  solidity: AbiInput | AbiOutput,
  contractName: string,
  defineType: CachedDefine,
  isInput?: boolean
) => {
  let type: GraphQLType

  const match = solidity.type.match(reType)
  if (!match) {
    throw new Error(`Did not match solidity type syntax: ${solidity.type}`)
  }
  const [baseType, size, array] = match.slice(1)

  if (baseType !== 'tuple') {
    const intSize = parseInt(size)
    type = solidityToGraphScalar(baseType, intSize)
  } else {
    let name = structToTypeName((solidity as any).internalType)
    if (isInput) {
      name = `${name}_Input`
    }

    type = defineType(name, () => {
      const fields: any = {}
      if (solidity.components) {
        solidity.components.forEach((component: AbiInput) => {
          fields[component.name] = {
            type: solidityToGraphIO(
              component,
              contractName,
              defineType,
              isInput
            ),
          }
        })
      }
      return isInput
        ? new GraphQLInputObjectType({ name, fields })
        : new GraphQLObjectType({ name, fields })
    })
  }

  return array ? new GraphQLList(type) : type
}
