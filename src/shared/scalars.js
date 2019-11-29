import { GraphQLScalarType } from 'graphql'

export const Bytes = new GraphQLScalarType({
  name: 'Bytes',
  serialize: value => value,
})

export const BigNumber = new GraphQLScalarType({
  name: 'BigNumber',
  serialize: value => value,
})

export const Address = new GraphQLScalarType({
  name: 'Address',
  serialize: value => value,
})

export const Timestamp = new GraphQLScalarType({
  name: 'Timestamp',
  serialize: value => new Date(value * 1000),
})

export const Int = new GraphQLScalarType({
  name: 'Int',
  serialize: value => {
    if (typeof value === 'number') {
      return value
    }
    const str = value.toString()
    return parseInt(str)
  },
})
