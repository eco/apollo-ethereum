pragma solidity >=0.4.21 <0.6.0;

contract Coercion {
  /* uint to Int */
  uint256 public smallInteger = 2048;

  /* uint to Timestamp */
  uint256 public createdAt = now;

  /* nested coercion */
  struct TempReading {
    uint256 when;
    uint256 temp;
  }

  TempReading[] public readings;

  event ReadingAdded(uint256 when, uint256 temp);

  constructor() public {
    readings.push(TempReading(now, 30));
    readings.push(TempReading(now, 28));
  }

  function recordTemp(uint256 temp) public {
    TempReading memory reading = TempReading(now, temp);
    readings.push(reading);
    emit ReadingAdded(reading.when, reading.temp);
  }
}
