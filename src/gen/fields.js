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

export const applyFieldConfig = (types, config, contractName) => {
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
      } else if (fieldConfig.mappingIndex) {
        const mapping = findField(qType, fieldConfig.mappingIndex)

        newType = new GraphQLList(
          new GraphQLObjectType({
            name: `${contractName}_${path.replace(/\./g, '_')}`,
            fields: {
              key: { type: getNamedType(mapping.args[0].type) },
              value: { type: mapping.type },
            },
          })
        )

        targetField.extensions = {
          directives: {
            mappingIndex: { mapping: fieldConfig.mappingIndex },
          },
        }
      }

      targetField.type = newType
    })
  })
}
