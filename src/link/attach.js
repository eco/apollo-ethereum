import { GraphQLEnumType, GraphQLInterfaceType } from 'graphql'
import {
  createContractResolver,
  createReadResolver,
  createWriteResolver,
  createEventResolver,
  createContractTypeResolver,
} from './resolvers'
import * as scalars from '../shared/scalars'
import modifyContract from '../shared/utils'

const attachResolver = (schema, contracts) => {
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

export default attachResolver
