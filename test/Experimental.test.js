const gql = require('graphql-tag')

const Experimental = artifacts.require('Experimental')

const config = {
  contracts: {
    Experimental: true,
  },
}

const variables = { address: Experimental.address }

const QUERY_CITY = gql`
  query($address: Address) {
    Experimental(address: $address) {
      hq {
        name
        state
        coordinates {
          latitude
          longitude
        }
      }
    }
  }
`

const QUERY_CITY_ARRAY_INDEX = gql`
  query($address: Address) {
    Experimental(address: $address) {
      city: tropical(index: 0) {
        name
        state
        coordinates {
          latitude
          longitude
        }
      }
    }
  }
`

const QUERY_CITY_MAPPING_KEY = gql`
  query($address: Address, $key: String) {
    Experimental(address: $address) {
      city: cities(key: $key) {
        name
        state
        coordinates {
          latitude
          longitude
        }
      }
    }
  }
`

const QUERY_CITY_ARRAY = gql`
  query($address: Address) {
    Experimental(address: $address) {
      allTropical {
        name
        state
        coordinates {
          latitude
          longitude
        }
      }
    }
  }
`

const MUTATION_ADD_CITY = gql`
  mutation($address: Address, $id: String, $city: Experimental_City_Input) {
    Experimental(address: $address) {
      createCity(id: $id, city: $city)
    }
  }
`

const QUERY_CITY_EVENTS = gql`
  query($address: Address) {
    Experimental(address: $address) {
      CityCreated {
        city {
          name
          state
          coordinates {
            latitude
            longitude
          }
        }
      }
    }
  }
`

contract('Experimental', () => {
  let client

  before(async () => {
    client = await createClient(config, { Experimental })
  })

  it('generates graphql schema', async () => {
    expect(client.source).to.matchSnapshot()
  })

  it('supports nested structs', async () => {
    const {
      Experimental: { hq },
    } = await client.execute(QUERY_CITY, variables)

    expect(hq.name).to.equal('Melbourne')
    expect(hq.state).to.equal('Victoria')
    expect(hq.coordinates.latitude.toString()).to.equal('378136')
    expect(hq.coordinates.longitude.toString()).to.equal('1449631')
  })

  it('supports state variable array of nested structs', async () => {
    const {
      Experimental: { city },
    } = await client.execute(QUERY_CITY_ARRAY_INDEX, variables)

    expect(city.name).to.equal('Bridgetown')
    expect(city.coordinates.latitude.toString()).to.equal('131060')
  })

  it('supports mapping of nested structs', async () => {
    const {
      Experimental: { city },
    } = await client.execute(QUERY_CITY_MAPPING_KEY, {
      ...variables,
      key: 'mel',
    })

    expect(city.name).to.equal('Melbourne')
    expect(city.coordinates.latitude.toString()).to.equal('378136')
  })

  it('supports returning array of nested structs from function', async () => {
    const {
      Experimental: { allTropical },
    } = await client.execute(QUERY_CITY_ARRAY, variables)

    expect(allTropical).to.have.length(1)

    const [city] = allTropical

    expect(city.name).to.equal('Bridgetown')
    expect(city.coordinates.latitude.toString()).to.equal('131060')
  })

  xit('accepts nested structs as function input', async () => {
    const res = await client.execute(MUTATION_ADD_CITY, {
      ...variables,
      id: 'sfo',
      city: {
        name: 'San Francisco',
        state: 'California',
        coordinates: { latitude: 12, longitude: 18 },
      },
    })

    console.log(res)

    const {
      Experimental: { city },
    } = await client.execute(QUERY_CITY_MAPPING_KEY, {
      ...variables,
      key: 'sfo',
    })

    expect(city.name).to.equal('San Francisco')
    expect(city.state).to.equal('California')
    expect(city.coordinates.latitude.toString()).to.equal('12')
    expect(city.coordinates.longitude.toString()).to.equal('18')
  })

  xit('supports events with nested struct fields', async () => {
    const {
      Experimental: { CityCreated },
    } = await client.execute(QUERY_CITY_EVENTS, variables)

    expect(CityCreated).to.have.length(1)

    const { city } = CityCreated[0]

    expect(city.name).to.equal('San Francisco')
    expect(city.coordinates.latitude.toString()).to.equal('12')
  })
})
