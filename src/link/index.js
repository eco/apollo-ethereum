import { buildSchema, execute } from 'graphql'
import { ApolloLink, Observable } from 'apollo-link'
import { attachResolvers, attachDirectives } from './attach'
import { setProvider } from './resolvers'

export const createEthereumLink = (config, options) => {
  const { source, contracts } = config
  const { provider, erc1820 } = options

  const schema = buildSchema(source)

  attachResolvers(schema, contracts)
  attachDirectives(schema, { erc1820 })

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
