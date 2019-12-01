const gql = require('graphql-tag')

const SelfDestruct = artifacts.require('SelfDestruct')

const config = {
  contracts: {
    SelfDestruct: {
      canSelfDestruct: true,
      fields: {
        integer: 'Int',
        'Log.randomNumber': 'Int',
      },
    },
  },
}

const QUERY = gql`
  query($address: Address) {
    SelfDestruct(address: $address) {
      __typename
      Log {
        message
        randomNumber
        _timestamp
      }
      ... on SelfDestructActive {
        message
        integer
      }
    }
  }
`

const MUTATION_DESTROY = gql`
  mutation($address: Address) {
    SelfDestruct(address: $address) {
      destroy
    }
  }
`

contract('SelfDestruct', () => {
  let client

  before(async () => {
    client = await createClient(config, { SelfDestruct })
  })

  it('generates graphql schema', async () => {
    expect(client.source).to.matchSnapshot()
  })

  it('queries available fields on active contracts', async () => {
    const data = await client.execute(QUERY, { address: SelfDestruct.address })
    const { Log, ...rest } = data.SelfDestruct
    expect(rest).to.deep.equal({
      __typename: 'SelfDestructActive',
      message: 'only available on active contracts',
      integer: 42,
    })
    expect(Log).to.containSubset([
      { message: 'Creating the contract', randomNumber: 20 },
    ])
  })

  it('does not query state on destroyed contracts', async () => {
    await client.execute(MUTATION_DESTROY, { address: SelfDestruct.address })

    const data = await client.execute(QUERY, {
      address: SelfDestruct.address,
    })
    const { Log, ...rest } = data.SelfDestruct
    expect(rest).to.deep.equal({
      __typename: 'SelfDestructComplete',
      // note: no other fields to appear
    })
    expect(Log).to.containSubset([
      { message: 'Creating the contract', randomNumber: 20 },
      { message: 'Destroying the contract', randomNumber: 30 },
    ])
  })
})
