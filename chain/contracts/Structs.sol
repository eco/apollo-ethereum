pragma solidity >=0.4.21 <0.6.0;

contract Structs {
  struct City {
    string name;
    string state;
  }

  mapping(string => City) public cities;

  constructor() public {
    cities["sfo"] = City("San Francisco", "California");
  }

  function createCity(string memory _id, string memory _name, string memory _state) public {
    cities[_id] = City(_name, _state);
  }
}
