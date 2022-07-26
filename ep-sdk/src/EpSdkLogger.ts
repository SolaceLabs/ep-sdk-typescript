
// level: 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'

export type TEpSdkLogDetails = {
  code: string;
  message?: string, 
  details?: any
}

export type TEpSdkLogEntry = {
  appId: string;
  logName: string;
} & TEpSdkLogDetails;

export enum EEpSdkLogLevel {
  Error = 0,
  Warn = 1,
  Info = 2,
  Debug = 3,
  Trace = 4
}

/**
 * Logger wrapper.
 * TODO: initialize with logger class ...
 */
export class EpSdkLogger {
  private static appId: string;
  private static level: EEpSdkLogLevel;

  public static initialize = ({ appId, level }:{
    appId: string;
    level: EEpSdkLogLevel;
  }): void => {
    EpSdkLogger.appId = appId;
    EpSdkLogger.level = level;
  }

  public static createLogEntry = (logName: string, details: TEpSdkLogDetails): TEpSdkLogEntry => {
    return {
      appId: EpSdkLogger.appId,
      logName: logName,
      ...details
    };
  }

  public static fatal = (logEntry: TEpSdkLogEntry): void => {
    console.error(JSON.stringify(logEntry, null, 2));
  }

  public static error = (logEntry: TEpSdkLogEntry): void => {
    console.error(JSON.stringify(logEntry, null, 2));
  }

  public static warn = (logEntry: TEpSdkLogEntry): void => {
    if(EpSdkLogger.level >= EEpSdkLogLevel.Warn) console.warn(JSON.stringify(logEntry, null, 2));
  }

  public static info = (logEntry: TEpSdkLogEntry): void => {
    if(EpSdkLogger.level >= EEpSdkLogLevel.Info) console.info(JSON.stringify(logEntry, null, 2));
  }

  public static debug = (logEntry: TEpSdkLogEntry): void => {
    if(EpSdkLogger.level >= EEpSdkLogLevel.Debug) console.debug(JSON.stringify(logEntry, null, 2));
  }

  public static trace = (logEntry: TEpSdkLogEntry): void => {
    if(EpSdkLogger.level >= EEpSdkLogLevel.Trace) console.log(JSON.stringify(logEntry, null, 2));
  }

}


