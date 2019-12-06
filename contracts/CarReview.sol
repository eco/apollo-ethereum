pragma solidity >=0.4.21 <0.6.0;

contract CarReview {
  enum Rating { Bad, Good }

  Rating public rating;
  string public review;

  constructor(Rating _rating, string memory _review) public {
    rating = _rating;
    review = _review;
  }
}
