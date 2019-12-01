const gql = require('graphql-tag')

const Coercion = artifacts.require('Coercion')

const config = {
  contracts: {
    Coercion: {
      fields: {
        createdAt: 'Timestamp',
        smallInteger: 'Int',
        'readings.when': 'Timestamp',
        'readings.temp': 'Int',
        'ReadingAdded.when': 'Timestamp',
        'ReadingAdded.temp': 'Int',
      },
    },
  },
}

const QUERY_STATE = gql`
  query($address: Address) {
    Coercion(address: $address) {
      smallInteger
      createdAt
    }
  }
`

const QUERY_STRUCT = gql`
  query($address: Address) {
    Coercion(address: $address) {
      firstReading: readings(index: "0") {
        when
        temp
      }
    }
  }
`

const MUTATION_EVENT = gql`
  mutation($address: Address) {
    Coercion(address: $address) {
      recordTemp(temp: 15)
    }
  }
`

const QUERY_EVENT = gql`
  query($address: Address) {
    Coercion(address: $address) {
      ReadingAdded {
        when
        temp
      }
    }
  }
`

contract('Coercion', () => {
  let client

  before(async () => {
    client = await createClient(config, { Coercion })
  })

  it('generates graphql schema', async () => {
    expect(client.source).to.matchSnapshot()
  })

  it('converts state variables', async () => {
    const {
      Coercion: { smallInteger, createdAt },
    } = await client.execute(QUERY_STATE, {
      address: Coercion.address,
    })

    expect(smallInteger)
      .to.be.a('number')
      .and.equal(2048)
    expect(createdAt).to.be.an.instanceof(Date)
    expect(createdAt.getTime()).to.be.closeTo(Date.now(), 20000)
  })

  it('converts struct fields', async () => {
    const {
      Coercion: { firstReading },
    } = await client.execute(QUERY_STRUCT, {
      address: Coercion.address,
    })

    expect(firstReading.when).to.be.an.instanceof(Date)
    expect(firstReading.temp).to.be.a('number')
  })

  it('converts event fields', async () => {
    const variables = { address: Coercion.address }
    await client.execute(MUTATION_EVENT, variables)

    const {
      Coercion: { ReadingAdded },
    } = await client.execute(QUERY_EVENT, variables)

    expect(ReadingAdded).to.have.length(1)
    expect(ReadingAdded[0].when).to.be.an.instanceof(Date)
    expect(ReadingAdded[0].temp).to.be.a('number')
  })
})
