import { GraphQLObjectType, getNamedType, GraphQLList } from 'graphql'
import * as scalars from '../shared/scalars'

const findField = (root, path) =>
  path.split('.').reduce(
    (parentConfig, fieldName) => {
      if (!parentConfig) {
        return null
      }
      const type = getNamedType(parentConfig.type)
      return type.getFields()[fieldName]
    },
    { type: root }
  )

export const applyFieldConfig = (types, config, contractName, getContract) => {
  types.forEach(qType => {
    Object.keys(config).forEach(path => {
      const targetField = findField(qType, path)

      if (!targetField) {
        return
      }

      const fieldConfig = config[path]
      let newType

      if (fieldConfig.type) {
        newType = scalars[fieldConfig.type]
        if (!newType) {
          newType = getContract(fieldConfig.type)
          let directiveValue = true
          if (fieldConfig.field) {
            directiveValue = { field: fieldConfig.field }
          }
          targetField.extensions = {
            directives: {
              contract: directiveValue,
            },
          }
        }
      } else if (fieldConfig.mappingIndex) {
        const mapping = findField(qType, fieldConfig.mappingIndex)

        newType = new GraphQLObjectType({
          name: `${contractName}_${path.replace(/\./g, '_')}`,
          fields: {
            key: { type: getNamedType(mapping.args[0].type) },
            value: { type: mapping.type },
          },
        })

        targetField.extensions = {
          directives: {
            mappingIndex: { mapping: fieldConfig.mappingIndex },
          },
        }
      }

      const isList = targetField.type instanceof GraphQLList
      targetField.type = isList ? new GraphQLList(newType) : newType
    })
  })
}
