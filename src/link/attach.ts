import { GraphQLObjectType } from 'graphql'
import {
  createContractResolver,
  createReadResolver,
  createWriteResolver,
  createEventResolver,
} from './resolvers'
import { AttachResolvers } from './interfaces'

const attachResolver: AttachResolvers = (schema, contracts) => {
  const query = schema.getQueryType()
  const mutation = schema.getMutationType()
  const queryFields = query && query.getFields()
  const mutationFields = mutation && mutation.getFields()

  Object.entries(contracts).forEach(([contractName, abi]) => {
    // contract resolution
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
}

export default attachResolver
