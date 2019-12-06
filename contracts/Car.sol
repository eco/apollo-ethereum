pragma solidity >=0.4.21 <0.6.0;

contract Car {
  string public name = "Tesla";

  address public firstReview;
  address[] public reviews;

  event ReviewAdded(address _address);

  function addReview(address _address) public {
    if (firstReview == address(0)) {
      firstReview = _address;
    }

    reviews.push(_address);

    emit ReviewAdded(_address);
  }

  function allReviews() public view returns (address[] memory) {
    return reviews;
  }
}
