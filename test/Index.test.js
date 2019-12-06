const gql = require('graphql-tag')

const Index = artifacts.require('Index')

const config = {
  contracts: {
    Index: {
      fields: {
        allProfiles: {
          mappingIndex: 'profiles',
        },
        allProcessed: {
          mappingIndex: 'processed',
        },
      },
    },
  },
}

const QUERY_PRIMITIVE_INDEX = gql`
  query($address: Address) {
    Index(address: $address) {
      allProcessed {
        key
        value
      }
    }
  }
`

const QUERY_STRUCT_INDEX = gql`
  query($address: Address) {
    Index(address: $address) {
      allProfiles {
        key
        value {
          name
          email
        }
      }
    }
  }
`

contract('Index', () => {
  let client

  before(async () => {
    client = await createClient(config, { Index })
  })

  it('generates graphql schema', async () => {
    expect(client.source).to.matchSnapshot()
  })

  it('retrives all entries for mapping to primitive', async () => {
    const res = await client.execute(QUERY_PRIMITIVE_INDEX, {
      address: Index.address,
    })

    expect(res.Index.allProcessed).to.deep.equal([
      {
        key: '0x61',
        value: true,
      },
      {
        key: '0x62',
        value: false,
      },
      {
        key: '0x63',
        value: true,
      },
    ])
  })

  it('retrieves all entries for mapping to struct', async () => {
    const res = await client.execute(QUERY_STRUCT_INDEX, {
      address: Index.address,
    })

    expect(res.Index.allProfiles).to.deep.equal([
      {
        key: '0xc0ffee254729296a45a3885639AC7E10F9d54979',
        value: {
          name: 'Harold',
          email: 'harold@aol.com',
        },
      },
      {
        key: '0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E',
        value: {
          name: 'Jane',
          email: 'jane@test.com',
        },
      },
      {
        key: '0x7fF3e5852080e70b6059320A7Fd4D97e6bcE9540',
        value: {
          name: 'Tones',
          email: 'tones@gmail.com',
        },
      },
    ])
  })
})
