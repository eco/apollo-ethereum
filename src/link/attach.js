import {
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  defaultFieldResolver,
} from 'graphql'
import {
  createContractResolver,
  createReadResolver,
  createWriteResolver,
  createEventResolver,
  createContractTypeResolver,
  directives,
} from './resolvers'
import * as scalars from '../shared/scalars'
import { modifyContract } from '../shared/utils'

export const attachResolvers = (schema, contracts) => {
  const query = schema.getQueryType()
  const mutation = schema.getMutationType()
  const queryFields = query && query.getFields()
  const mutationFields = mutation && mutation.getFields()

  Object.entries(contracts).forEach(([contractName, abi]) => {
    // contract resolution
    const contractField = queryFields[contractName]
    if (contractField) {
      contractField.resolve = createContractResolver(abi)
      if (contractField.type instanceof GraphQLInterfaceType) {
        contractField.type.resolveType = createContractTypeResolver(
          contractName
        )
      }
    }
    if (mutationFields && mutationFields[contractName]) {
      mutationFields[contractName].resolve = createContractResolver(abi)
    }

    // field resolution
    const mutationType = schema.getType(`${contractName}Mutative`)
    const mFields = mutationType ? mutationType.getFields() : {}

    abi.forEach(item => {
      if (mFields[item.name]) {
        mFields[item.name].resolve = createWriteResolver(item)
        return
      }

      const resolver =
        item.type === 'event'
          ? createEventResolver(item)
          : createReadResolver(item)

      modifyContract(schema, contractName, queryType => {
        const qFields = queryType.getFields()
        qFields._address.resolve = contract => contract.options.address
        if (qFields[item.name]) {
          qFields[item.name].resolve = resolver
        }
      })
    })
  })

  // scalars
  Object.entries(scalars).forEach(([name, scalar]) => {
    const type = schema.getType(name)
    if (type) {
      Object.assign(type, scalar)
    }
  })

  // enums
  const typeMap = schema.getTypeMap()
  Object.values(typeMap)
    .filter(
      type => type instanceof GraphQLEnumType && !type.name.startsWith('__')
    )
    .forEach(type => {
      const values = {}
      type.getValues().forEach((value, index) => {
        values[value.name] = { value: index }
      })
      const newType = new GraphQLEnumType({
        name: type.name,
        values,
      })
      Object.assign(type, newType)
    })
}

export const attachDirectives = (schema, options) => {
  const typeMap = schema.getTypeMap()
  Object.values(typeMap)
    .filter(
      type => type instanceof GraphQLObjectType && !type.name.startsWith('__')
    )
    .forEach(type => {
      const fields = type.getFields()
      Object.values(fields).forEach(field => {
        field.astNode.directives.forEach(directive => {
          const origResolver = field.resolve || defaultFieldResolver
          const directiveName = directive.name.value

          const resolver = directives[directiveName]
          const directiveArgs = {}
          directive.arguments.forEach(arg => {
            directiveArgs[arg.name.value] = arg.value.value
          })
          const directiveConfig = options[directiveName]

          // eslint-disable-next-line no-param-reassign
          field.resolve = async (...args) => {
            const resolveCallback = updatedFieldArgs => {
              Object.assign(args[1], updatedFieldArgs)
              return origResolver(...args)
            }
            return resolver(resolveCallback, directiveArgs, directiveConfig)
          }
        })
      })
    })
}
