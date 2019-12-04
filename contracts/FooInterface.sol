pragma solidity >=0.4.21 <0.6.0;

contract FooInterface {
  string public implementsInterface = "Foo";

  uint256 num = 1;

  function set(uint256 x) public {
    num = x;
  }
}
