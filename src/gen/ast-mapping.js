import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLBoolean,
} from 'graphql'
import { solidityToGraphScalar } from './types/graph-scalar'

const normalizeName = name => name.replace(/^_+/, '')

export const graphTypeFromAst = (
  contractNode,
  itemName,
  defineContractType
) => {
  const itemDef = contractNode.nodes.find(node => node.name === itemName)

  let inputMode = false

  const astToGraph = node => {
    switch (node.nodeType) {
      case 'EventDefinition': {
        const eventType = defineContractType(node.name, name => {
          const fields = astToGraph(node.parameters)
          return new GraphQLObjectType({ name, fields })
        })
        return {
          type: new GraphQLList(eventType),
          description: node.documentation,
        }
      }

      case 'ParameterList': {
        const fields = {}
        node.parameters.forEach(param => {
          const fieldName = normalizeName(param.name)
          fields[fieldName] = astToGraph(param)
        })
        return fields
      }

      case 'ElementaryTypeName': {
        return solidityToGraphScalar(node.name)
      }

      case 'UserDefinedTypeName': {
        const typeDef = contractNode.nodes.find(n => n.name === node.name)
        return astToGraph(typeDef)
      }

      case 'EnumDefinition': {
        return defineContractType(node.name, name => {
          const values = {}
          node.members.forEach((value, index) => {
            values[value.name] = { value: index }
          })
          return new GraphQLEnumType({ name, values })
        })
      }

      case 'StructDefinition': {
        let typeName = node.name
        if (inputMode) {
          typeName += '_Input'
        }

        return defineContractType(typeName, name => {
          const fields = {}
          node.members.forEach(member => {
            const fieldName = normalizeName(member.name)
            fields[fieldName] = astToGraph(member)
          })
          return inputMode
            ? new GraphQLInputObjectType({ name, fields })
            : new GraphQLObjectType({ name, fields })
        })
      }

      case 'FunctionDefinition': {
        inputMode = true
        const args = astToGraph(node.parameters)
        inputMode = false

        const type = defineContractType(node.name, name => {
          const fields = astToGraph(node.returnParameters)
          const keys = Object.keys(fields)
          switch (keys.length) {
            case 0:
              return GraphQLBoolean
            case 1:
              return fields[keys[0]].type
            default:
              return new GraphQLObjectType({ name, fields })
          }
        })
        return { args, type, description: node.documentation }
      }

      case 'VariableDeclaration': {
        if (node.stateVariable) {
          if (node.typeName.nodeType === 'ArrayTypeName') {
            return {
              args: {
                index: { type: solidityToGraphScalar('uint256') },
              },
              type: astToGraph(node.typeName.baseType),
            }
          }

          if (node.typeName.nodeType === 'Mapping') {
            return {
              args: {
                key: { type: astToGraph(node.typeName.keyType) },
              },
              type: astToGraph(node.typeName.valueType),
            }
          }
        }

        return { type: astToGraph(node.typeName) }
      }

      case 'ArrayTypeName': {
        return new GraphQLList(astToGraph(node.baseType))
      }

      default: {
        throw new Error(`Unsupported AST node type: ${node.type}`)
      }
    }
  }

  return astToGraph(itemDef)
}
