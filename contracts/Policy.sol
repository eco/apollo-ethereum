pragma solidity >=0.4.21 <0.6.0;

contract Policy {
  mapping(bytes32 => address) interfaces;

  function setInterface(bytes32 interfaceHash, address implementer) public {
    interfaces[interfaceHash] = implementer;
  }

  function policyFor(bytes32 interfaceHash) public view returns (address) {
    return interfaces[interfaceHash];
  }
}
