const gql = require('graphql-tag')

const Types = artifacts.require('Types')

const config = {
  contracts: {
    Types: true,
  },
}

const QUERY_TYPES = gql`
  query($address: Address) {
    Types(address: $address) {
      bigNumberA
      bigNumberB
      integer
      bytesA
      bytesB
      stringType
      firstBool: bools(index: "0")
      lastInt: ints(index: "4")
      allBools
      allInts
      tlaScore(key: "0x637461")
      createdAt
    }
  }
`

contract('Types', () => {
  let client

  before(async () => {
    client = await createClient(config, { Types })
  })

  it('generates graphql schema', async () => {
    expect(client.source).to.matchSnapshot()
  })

  it('returns the correct types', async () => {
    const variables = { address: Types.address }
    const data = await client.execute(QUERY_TYPES, variables)
    expect(data).to.matchSnapshot()
  })
})
