const gql = require('graphql-tag')

const Structs = artifacts.require('Structs')

const config = {
  contracts: {
    Structs: true,
  },
}

const QUERY_CITY = gql`
  query($address: Address, $key: String) {
    Structs(address: $address) {
      city: cities(key: $key) {
        name
        state
      }
    }
  }
`

const MUTATION_ADD_CITY = gql`
  mutation($address: Address, $id: String, $name: String, $state: String) {
    Structs(address: $address) {
      createCity(id: $id, name: $name, state: $state)
    }
  }
`

contract('Structs', () => {
  let client

  before(async () => {
    client = await createClient(config, { Structs })
  })

  it('generates graphql schema', async () => {
    expect(client.source).to.matchSnapshot()
  })

  it('returns initial city', async () => {
    const variables = { address: Structs.address, key: 'sfo' }
    const data = await client.execute(QUERY_CITY, variables)
    expect(data.Structs.city).to.deep.equal({
      name: 'San Francisco',
      state: 'California',
    })
  })

  it('allows city to be added', async () => {
    await client.execute(MUTATION_ADD_CITY, {
      address: Structs.address,
      id: 'mel',
      name: 'Melbourne',
      state: 'Victoria',
    })

    const data = await client.execute(QUERY_CITY, {
      address: Structs.address,
      key: 'mel',
    })

    expect(data.Structs.city).to.deep.equal({
      name: 'Melbourne',
      state: 'Victoria',
    })
  })
})
