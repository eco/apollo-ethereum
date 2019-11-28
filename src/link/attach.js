import { GraphQLObjectType, GraphQLEnumType } from 'graphql'
import {
  createContractResolver,
  createReadResolver,
  createWriteResolver,
  createEventResolver,
} from './resolvers'

const scalars = {
  Timestamp: value => new Date(value * 1000),
}

const attachResolver = (schema, contracts) => {
  const query = schema.getQueryType()
  const mutation = schema.getMutationType()
  const queryFields = query && query.getFields()
  const mutationFields = mutation && mutation.getFields()

  // contract resolution
  Object.entries(contracts).forEach(([contractName, abi]) => {
    const resolver = createContractResolver(abi)
    if (queryFields && queryFields[contractName]) {
      queryFields[contractName].resolve = resolver
    }
    if (mutationFields && mutationFields[contractName]) {
      mutationFields[contractName].resolve = resolver
    }

    // field resolution
    const queryType = schema.getType(contractName)
    const mutationType = schema.getType(`${contractName}Mutative`)
    const qFields =
      queryType instanceof GraphQLObjectType && queryType.getFields()
    const mFields =
      mutationType instanceof GraphQLObjectType && mutationType.getFields()
    if (qFields) {
      qFields._address.resolve = contract => contract.options.address
    }
    abi.forEach(item => {
      if (qFields && item.type === 'event') {
        qFields[item.name].resolve = createEventResolver(item)
      } else if (qFields && qFields[item.name]) {
        qFields[item.name].resolve = createReadResolver(item)
      } else if (mFields && mFields[item.name]) {
        mFields[item.name].resolve = createWriteResolver(item)
      }
    })
  })

  // scalars
  Object.entries(scalars).forEach(([name, serialize]) => {
    const type = schema.getType(name)
    if (type) {
      Object.assign(type, { serialize })
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
