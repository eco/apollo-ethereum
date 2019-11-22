import { GraphQLObjectType } from 'graphql'
import {
  createContractResolver,
  createReadResolver,
  createWriteResolver,
} from './resolvers'
import { AttachFieldResolver, AttachResolvers } from './interfaces'

const attachFieldResolver: AttachFieldResolver = (
  fields,
  item,
  createResolver
) => {
  if (fields && fields[item.name]) {
    // eslint-disable-next-line no-param-reassign
    fields[item.name].resolve = createResolver(item)
  }
}

const attachResolver: AttachResolvers = (schema, contracts) => {
  const query = schema.getQueryType()
  const mutation = schema.getMutationType()
  const queryFields = query && query.getFields()
  const mutationFields = mutation && mutation.getFields()

  Object.entries(contracts).forEach(([contractName, abi]) => {
    // contract resolvers
    const resolver = createContractResolver(abi)
    if (queryFields && queryFields[contractName]) {
      queryFields[contractName].resolve = resolver
    }
    if (mutationFields && mutationFields[contractName]) {
      mutationFields[contractName].resolve = resolver
    }

    // field resolvers
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
      attachFieldResolver(qFields, item, createReadResolver)
      attachFieldResolver(mFields, item, createWriteResolver)
    })
  })
}

export default attachResolver
