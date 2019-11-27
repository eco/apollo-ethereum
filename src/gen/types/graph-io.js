import { GraphQLList, GraphQLInputObjectType, GraphQLObjectType } from 'graphql'
import { solidityToGraphScalar } from './graph-scalar'

const reType = /^([a-z]+)(\d+)?(\[\d*\])?$/
const reStruct = /^struct ([\w.]+)(\[\d*\])?$/

const structToTypeName = str => {
  const match = str.match(reStruct)
  if (!match) {
    throw new Error(`Did not match solidity struct name: ${str}`)
  }
  return match[1].split('.')[1]
}

// @ts-ignore
export const solidityToGraphIOField = (component, defineType, isInput) => {
  const match = component.type.match(reType)
  if (!match) {
    throw new Error(`Did not match solidity type syntax: ${component.type}`)
  }
  const [baseType, size, array] = match.slice(1)

  let type
  if (baseType !== 'tuple') {
    const intSize = parseInt(size)
    type = solidityToGraphScalar(baseType, intSize)
  } else {
    let typeName = structToTypeName(component.internalType)
    if (isInput) {
      typeName = `${typeName}_Input`
    }

    type = defineType(typeName, name => {
      const fields = {}
      if (component.components) {
        component.components.forEach(child => {
          fields[child.name] = {
            type: solidityToGraphIOField(child, defineType, isInput),
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

export const solidityToGraphIO = (io, defineType, isInput) => {
  const obj = {}
  io.forEach(item => {
    const name = item.name.replace(/^_+/, '') || 'key'
    const type = solidityToGraphIOField(item, defineType, isInput)
    obj[name] = { type }
  })
  return obj
}
