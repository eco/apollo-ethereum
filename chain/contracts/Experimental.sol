pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;

contract Experimental {
  struct Geo {
    uint256 latitude;
    uint256 longitude;
  }

  struct City {
    string name;
    string state;
    Geo coordinates;
  }

  City public hq;

  mapping(string => City) public cities;

  constructor() public {
    hq = cities["mel"] = City("Melbourne", "Victoria", Geo(378136, 1449631));
  }

  function createCity(string memory _id, City memory _city) public {
    cities[_id] = _city;
  }
}
