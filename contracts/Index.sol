pragma solidity >=0.4.21 <0.6.0;

contract Index {
  struct Profile {
    string name;
    string email;
  }

  // maps to primitive type
  mapping(bytes1 => bool) public processed;
  bytes1[] _processedIndex;

  // maps to struct type
  mapping(address => Profile) public profiles;
  address[] _profilesIndex;

  constructor() public {
    // primitive mapping
    processed["a"] = true;
    _processedIndex.push("a");
    processed["b"] = false;
    _processedIndex.push("b");
    processed["c"] = true;
    _processedIndex.push("c");

    // profile 1
    profiles[0xc0ffee254729296a45a3885639AC7E10F9d54979] = Profile("Harold", "harold@aol.com");
    _profilesIndex.push(0xc0ffee254729296a45a3885639AC7E10F9d54979);

    // profile 2
    profiles[0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E] = Profile("Jane", "jane@test.com");
    _profilesIndex.push(0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E);

    // profile 3
    profiles[0x7fF3e5852080e70b6059320A7Fd4D97e6bcE9540] = Profile("Tones", "tones@gmail.com");
    _profilesIndex.push(0x7fF3e5852080e70b6059320A7Fd4D97e6bcE9540);
  }

  function allProfiles() public view returns (address[] memory) {
    return _profilesIndex;
  }

  function allProcessed() public view returns(bytes1[] memory) {
    return _processedIndex;
  }
}
