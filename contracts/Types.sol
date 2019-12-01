pragma solidity >=0.4.21 <0.6.0;

contract Types {
  /* boolean */
  bool public boolean = true;

  /* integers */
  int public bigNumberA = 42;
  int56 public bigNumberB = 56;
  int48 public integer = 48;

  /* bytes */
  bytes3 public bytesA = "foo";
  bytes public bytesB = "dynamically sized byte sequence";

  /* string */
  string public stringType = "dynamically sized string";

  /* arrays */
  bool[] public bools = [true, false, true];
  uint8[] public ints = [1, 2, 3, 4, 5];

  /* mappings */
  mapping(bytes3 => uint256) public tlaScore;

  constructor() public {
    tlaScore["foo"] = 32;
    tlaScore["cta"] = 1298;
  }

  function allBools() public view returns (bool[] memory) {
    return bools;
  }

  function allInts() public view returns (uint8[] memory) {
    return ints;
  }
}
