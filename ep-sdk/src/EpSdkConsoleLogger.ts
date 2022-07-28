import { EEpSdkLogLevel, IEpSdkLoggerInstance, IEpSdkLogDetails, IEpSdkLogEntry } from "./EpSdkLogger";


export class EpSdkConsoleLogger implements IEpSdkLoggerInstance {
  appId: string;
  epSdkLogLevel: EEpSdkLogLevel;

  constructor(appId: string, epSdkLogLevel: EEpSdkLogLevel) {
    this.appId = appId;
    this.epSdkLogLevel = epSdkLogLevel;
  }

  public createLogEntry = (logName: string, details: IEpSdkLogDetails): IEpSdkLogEntry => {
    const d = new Date();
    return {
      logger: EpSdkConsoleLogger.name,
      appId: this.appId,
      logName: logName,
      timestamp: d.toUTCString(),
      ...details
    };
  }

  private createOutput(logEntry: IEpSdkLogEntry): any {
    return JSON.stringify({
      epSdkLogLevel: this.epSdkLogLevel,
      ...logEntry
    }, null, 2);
  }
  public fatal = (logEntry: IEpSdkLogEntry): void => {
    console.error(this.createOutput(logEntry));
  }

  public error = (logEntry: IEpSdkLogEntry): void => {
    console.error(this.createOutput(logEntry));
  }

  public warn = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel >= EEpSdkLogLevel.Warn) console.warn(this.createOutput(logEntry));
  }

  public info = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel >= EEpSdkLogLevel.Info) console.info(this.createOutput(logEntry));
  }

  public debug = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel >= EEpSdkLogLevel.Debug) console.debug(this.createOutput(logEntry));
  }

  public trace = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel >= EEpSdkLogLevel.Trace) console.log(this.createOutput(logEntry));
  }

}


