import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  printSchema,
  GraphQLFieldConfigMap,
} from 'graphql'

interface Contract {
  contractName: string
}

export default (contracts: Contract[]): string => {
  const fields: GraphQLFieldConfigMap<null, null> = {}

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
