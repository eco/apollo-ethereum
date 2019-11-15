import { ApolloLink, Observable } from 'apollo-link'
import { buildSchema, execute } from 'graphql'

export const createEthLink = (source: string): ApolloLink => {
  const schema = buildSchema(source)
  const query = schema.getQueryType()

  if (query) {
    const fields = query.getFields()
    Object.values(fields).forEach(field => {
      // eslint-disable-next-line no-param-reassign
      field.resolve = () => ({ address: '0x' })
    })
  }

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
