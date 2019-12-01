import { buildSchema, execute } from 'graphql'
import { ApolloLink, Observable } from 'apollo-link'
import attachResolvers from './attach'
import { setProvider } from './resolvers'

export const createEthereumLink = (options, provider) => {
  const schema = buildSchema(options.source)
  attachResolvers(schema, options.contracts)

  setProvider(provider)

  return new ApolloLink(operation => {
    return new Observable(observer => {
      Promise.resolve(
        execute(schema, operation.query, null, null, operation.variables)
      ).then(executionResult => {
        observer.next(executionResult)
        observer.complete()
      })
    })
  })
}
