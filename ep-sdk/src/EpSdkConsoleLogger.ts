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

  public fatal = (logEntry: IEpSdkLogEntry): void => {
    console.error(JSON.stringify(logEntry, null, 2));
  }

  public error = (logEntry: IEpSdkLogEntry): void => {
    console.error(JSON.stringify(logEntry, null, 2));
  }

  public warn = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel >= EEpSdkLogLevel.Warn) console.warn(JSON.stringify(logEntry, null, 2));
  }

  public info = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel >= EEpSdkLogLevel.Info) console.info(JSON.stringify(logEntry, null, 2));
  }

  public debug = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel >= EEpSdkLogLevel.Debug) console.debug(JSON.stringify(logEntry, null, 2));
  }

  public trace = (logEntry: IEpSdkLogEntry): void => {
    if(this.epSdkLogLevel >= EEpSdkLogLevel.Trace) console.log(JSON.stringify(logEntry, null, 2));
  }

}


