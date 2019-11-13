import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  printSchema,
} from 'graphql'

export default contracts => {
  const fields = {}

  contracts.forEach(contract => {
    const { contractName: name } = contract
    const type = new GraphQLObjectType({
      name,
      fields: {
        $address: { type: new GraphQLNonNull(GraphQLString) },
      },
    })
    fields[name] = { type }
  })

  const query = new GraphQLObjectType({
    name: 'Query',
    fields,
  })

  const schema = new GraphQLSchema({ query })

  return printSchema(schema)
}
