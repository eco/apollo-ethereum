pragma solidity >=0.4.21 <0.6.0;

contract Events {
  enum LogLevel { Info, Warning, Error }

  /**
    Represents a log event
   */
  event LogEvent(LogLevel _level, string message);

  constructor() public {
    emit LogEvent(LogLevel.Info, "Constructing contract");
  }

  function triggerWarning() public {
    emit LogEvent(LogLevel.Warning, "Warning: triggered manually");
  }

  function triggerError() public {
    emit LogEvent(LogLevel.Error, "Error function triggered");
  }
}
