const gql = require('graphql-tag')

const Car = artifacts.require('Car')
const CarReview = artifacts.require('CarReview')

const config = {
  contracts: {
    Car: {
      fields: {
        firstReview: 'CarReview',
        allReviews: 'CarReview',
        ReviewAdded: {
          type: 'CarReview',
          field: 'address',
        },
      },
    },
    CarReview: true,
  },
}

const QUERY_FIRST_REVIEW = gql`
  query($address: Address!) {
    Car(address: $address) {
      name
      firstReview {
        rating
        review
      }
    }
  }
`

const QUERY_ALL_REVIEWS = gql`
  query($address: Address) {
    Car(address: $address) {
      allReviews {
        rating
        review
      }
    }
  }
`

const QUERY_REVIEW_EVENTS = gql`
  query($address: Address) {
    Car(address: $address) {
      ReviewAdded {
        rating
        review
      }
    }
  }
`

contract('CarGraph', () => {
  let client

  before(async () => {
    client = await createClient(config, { Car, CarReview })
  })

  it('generates graphql schema', async () => {
    expect(client.source).to.matchSnapshot()
  })

  it('links address fields', async () => {
    const res = await client.execute(QUERY_FIRST_REVIEW, {
      address: Car.address,
    })
    expect(res.Car).to.deep.equal({
      name: 'Tesla',
      firstReview: {
        rating: 'Good',
        review: 'This car rocks',
      },
    })
  })

  it('links array of addresses', async () => {
    const res = await client.execute(QUERY_ALL_REVIEWS, {
      address: Car.address,
    })
    expect(res.Car.allReviews).to.deep.equal([
      {
        rating: 'Good',
        review: 'This car rocks',
      },
      {
        rating: 'Bad',
        review: 'This car does not rock',
      },
    ])
  })

  it('links addresses from event fields', async () => {
    const res = await client.execute(QUERY_REVIEW_EVENTS, {
      address: Car.address,
    })
    expect(res.Car.ReviewAdded).to.deep.equal([
      {
        rating: 'Good',
        review: 'This car rocks',
      },
      {
        rating: 'Bad',
        review: 'This car does not rock',
      },
    ])
  })
})
