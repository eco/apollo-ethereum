pragma solidity >=0.4.21 <0.6.0;

contract Types {
  /* boolean */
  bool public boolean = true;

  /* integers */
  int public bigNumberA = 42;
  int56 public bigNumberB = 56;
  int48 public integer = 48;

  /* bytes */
  bytes3 public stringA = "foo";
  bytes public stringB = "dynamically sized byte sequence";

  /* string */
  string public stringC = "dynamically sized string";

  /* arrays */

  /* date */
  uint256 public createdAt = now;
}
