import { GraphQLDirective, GraphQLString } from 'graphql'

export const erc1820 = new GraphQLDirective({
  name: 'erc1820',
  locations: ['FIELD_DEFINITION'],
  args: {
    interfaceName: { type: GraphQLString },
  },
})

export const mappingIndex = new GraphQLDirective({
  name: 'mappingIndex',
  locations: ['FIELD_DEFINITION'],
  args: {
    mapping: { type: GraphQLString },
  },
})

export const contract = new GraphQLDirective({
  name: 'contract',
  locations: ['FIELD_DEFINITION'],
  args: {
    field: { type: GraphQLString },
  },
})
