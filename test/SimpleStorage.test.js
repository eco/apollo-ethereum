const gql = require('graphql-tag')

const SimpleStorage = artifacts.require('SimpleStorage')

const config = {
  contracts: {
    SimpleStorage: true,
  },
}

const QUERY_GET = gql`
  query($address: Address) {
    SimpleStorage(address: $address) {
      _address
      get
    }
  }
`

const MUTATION_SET = gql`
  mutation($address: Address, $value: BigNumber) {
    SimpleStorage(address: $address) {
      set(x: $value)
    }
  }
`

contract('SimpleStorage', () => {
  let client

  before(async () => {
    client = await createClient(config, { SimpleStorage })
  })

  it('generates graphql schema', async () => {
    expect(client.source).to.matchSnapshot()
  })

  it('gets initial value, returns contract address', async () => {
    const variables = { address: SimpleStorage.address }

    const data = await client.execute(QUERY_GET, variables)
    expect(data.SimpleStorage.get.toNumber()).to.equal(42)
    expect(data.SimpleStorage._address).to.equal(SimpleStorage.address)
  })

  it('sets and gets value, returning boolean on successful write', async () => {
    const variables = { address: SimpleStorage.address, value: 100 }

    const mutation = await client.execute(MUTATION_SET, variables)
    expect(mutation.SimpleStorage.set).to.equal(true)

    const queryVariables = { address: SimpleStorage.address }

    const query = await client.execute(QUERY_GET, queryVariables)
    expect(query.SimpleStorage.get.toNumber()).to.equal(100)
  })
})
