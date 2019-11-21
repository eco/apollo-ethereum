import { buildSchema, execute } from 'graphql'
import { ApolloLink, Observable } from 'apollo-link'
import { AbiItem } from 'web3-utils'
import attachResolvers from './attach'

interface AbiMap {
  [contractName: string]: AbiItem[]
}
interface LinkOptions {
  source: string
  contracts: AbiMap
}
type createEthereumLink = (options: LinkOptions) => { link: ApolloLink }

export const createEthereumLink: createEthereumLink = options => {
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
