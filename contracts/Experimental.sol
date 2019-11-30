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
  City[] public tropical;

  mapping(string => City) public cities;

  event CityCreated(City city);

  constructor() public {
    cities["mel"] = City("Melbourne", "Victoria", Geo(378136, 1449631));
    cities["bgi"] = City("Bridgetown", "Barbados", Geo(131060, 596132));

    hq = cities["mel"];
    tropical.push(cities["bgi"]);
  }

  function createCity(string memory _id, City memory _city) public {
    cities[_id] = _city;
    emit CityCreated(_city);
  }

  function allTropical() public view returns (City[] memory) {
    return tropical;
  }
}
