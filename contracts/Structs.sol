pragma solidity >=0.4.21 <0.6.0;

/**
The `Structs` contract demonstrates the ability to use complex
objects across read and write interfaces.
*/
contract Structs {
  /**
  An object containing details pertaining to a city
  */
  struct City {
    /**
    The name of the city
     */
    string name;
    /**
    The state in which the city is located
    */
    string state;
  }

  /**
    The `cities` variable maps strings (city IDs) to
    structs containing details about the city
  */
  mapping(string => City) public cities;

  /**
    The constructor populates the cities mapping with an
    example city.
  */
  constructor() public {
    cities["sfo"] = City("San Francisco", "California");
  }

  /**
    Creates a new city using the provided information. If a city
    with the same ID exists, it will be overwritten
  */
  function createCity(string memory _id, string memory _name, string memory _state) public {
    cities[_id] = City(_name, _state);
  }
}
