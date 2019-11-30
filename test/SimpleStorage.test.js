const gql = require('graphql-tag')

const SimpleStorage = artifacts.require('SimpleStorage')

const QUERY_GET = gql`
  query($address: Address) {
    SimpleStorage(address: $address) {
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
    client = await createClient(
      {
        contracts: {
          SimpleStorage: true,
        },
      },
      { SimpleStorage }
    )
  })

  it('generates graphql schema', async () => {
    expect(client.source).to.matchSnapshot()
  })

  it('gets initial value', async () => {
    const variables = { address: SimpleStorage.address }
    const data = await client.execute(QUERY_GET, variables)
    expect(data.SimpleStorage.get.toNumber()).to.equal(42)
  })

  it('sets and gets value', async () => {
    const variables = { address: SimpleStorage.address, value: 100 }

    const mutation = await client.execute(MUTATION_SET, variables)
    expect(mutation.SimpleStorage.set).to.equal(true)

    const query = await client.execute(QUERY_GET, variables)
    expect(query.SimpleStorage.get.toNumber()).to.equal(100)
  })
})
