const gql = require('graphql-tag')

const Events = artifacts.require('Events')

const config = {
  contracts: {
    Events: true,
  },
}

const QUERY_EVENTS = gql`
  query($address: Address) {
    Events(address: $address) {
      LogEvent {
        level
        message
        _timestamp
      }
    }
  }
`

contract('Events', () => {
  let client

  before(async () => {
    client = await createClient(config, { Events })
  })

  it('generates graphql schema', async () => {
    expect(client.source).to.matchSnapshot()
  })

  it('returns the correct types', async () => {
    const variables = { address: Events.address }
    const data = await client.execute(QUERY_EVENTS, variables)

    expect(data.Events.LogEvent).to.containSubset([
      { level: 'Info', message: 'Constructing contract' },
      { level: 'Warning', message: 'Warning: triggered manually' },
      { level: 'Error', message: 'Error function triggered' },
    ])

    const timestamps = data.Events.LogEvent.map(e => e._timestamp.getTime())

    expect(timestamps[0]).to.be.closeTo(Date.now(), 20000)
    expect(timestamps[1]).to.be.closeTo(Date.now(), 20000)
    expect(timestamps[2]).to.be.closeTo(Date.now(), 20000)
  })
})
