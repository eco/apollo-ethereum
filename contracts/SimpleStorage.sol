pragma solidity >=0.4.21 <0.6.0;

contract SimpleStorage {
  uint256 storedData = 42;

  function set(uint256 x) public {
    storedData = x;
  }

  function get() public view returns (uint256) {
    return storedData;
  }
}
