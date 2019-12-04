const gql = require('graphql-tag')

const FooInterface = artifacts.require('FooInterface')
const Policy = artifacts.require('Policy')

const config = {
  contracts: {
    FooInterface: {
      interfaceName: 'Foo',
    },
  },
}

const options = {
  erc1820: {
    lookupAddress: Policy.address,
    lookupMethod: 'policyFor',
  },
}

const QUERY = gql`
  query {
    FooInterface {
      _address
      implementsInterface
    }
  }
`

const MUTATION = gql`
  mutation {
    FooInterface {
      set(x: 12)
    }
  }
`

contract('ERC1820', () => {
  let client

  before(async () => {
    client = await createClient(config, { FooInterface }, options)
  })

  it('generates graphql schema', async () => {
    expect(client.source).to.matchSnapshot()
  })

  it('looks up address on query', async () => {
    const res = await client.execute(QUERY)
    expect(res.FooInterface.implementsInterface).to.equal('Foo')
    expect(res.FooInterface._address).to.equal(FooInterface.address)
  })

  it('looks up address on mutation', async () => {
    const res = await client.execute(MUTATION)
    expect(res.FooInterface.set).to.equal(true)
  })
})
