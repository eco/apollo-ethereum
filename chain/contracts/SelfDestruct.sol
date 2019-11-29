pragma solidity >=0.4.21 <0.6.0;

contract SelfDestruct {
  string public message = "only available on active contracts";

  uint256 public integer = 42;

  event Log(string message, uint256 randomNumber);

  constructor() public {
    emit Log("Creating the contract", 20);
  }

  function destroy() public {
    emit Log("Destroying the contract", 30);
    selfdestruct(msg.sender);
  }
}
