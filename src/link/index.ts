import { buildSchema, execute } from 'graphql'
import { ApolloLink, Observable } from 'apollo-link'
import attachResolvers from './attach'
import { CreateEthereumLink } from './interfaces'

export const createEthereumLink: CreateEthereumLink = options => {
  const schema = buildSchema(options.source)
  attachResolvers(schema, options.contracts)

  const link = new ApolloLink(operation => {
    return new Observable(observer => {
      Promise.resolve(
        execute(schema, operation.query, null, null, operation.variables)
      ).then(executionResult => {
        observer.next(executionResult)
        observer.complete()
      })
    })
  })

  return { link }
}
