import { EpSdkLoggerNotInitializedError } from "./EpSdkErrors";

export interface IEpSdkLogDetails {
  code: string;
  message?: string, 
  details?: any
}

export interface IEpSdkLogEntry extends IEpSdkLogDetails {
  logger: string;
  appId: string;
  logName: string;
  timestamp: string;
};

export enum EEpSdkLogLevel {
  Silent = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
  Trace = 5,
}

export interface IEpSdkLoggerInstance {
  appId: string;
  epSdkLogLevel: EEpSdkLogLevel;

  createLogEntry: (logName: string, details: IEpSdkLogDetails) => IEpSdkLogEntry;

  fatal: (logEntry: IEpSdkLogEntry) => void;

  error: (logEntry: IEpSdkLogEntry) => void;

  warn: (logEntry: IEpSdkLogEntry) => void;
  
  info: (logEntry: IEpSdkLogEntry) => void;

  debug: (logEntry: IEpSdkLogEntry) => void;

  trace: (logEntry: IEpSdkLogEntry) => void;

}


/**
 * Logger wrapper.
 */
export class EpSdkLogger {
  private static epSdkLoggerInstance: IEpSdkLoggerInstance | undefined = undefined;

  public static initialize = ({ epSdkLoggerInstance }:{
    epSdkLoggerInstance: IEpSdkLoggerInstance;
  }): void => {
    EpSdkLogger.epSdkLoggerInstance = epSdkLoggerInstance;
  }

  public static createLogEntry = (logName: string, details: IEpSdkLogDetails): IEpSdkLogEntry => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name);
    return EpSdkLogger.epSdkLoggerInstance.createLogEntry(logName, details);
  }

  public static fatal = (logEntry: IEpSdkLogEntry): void => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name);
    EpSdkLogger.epSdkLoggerInstance.fatal(logEntry);
  }

  public static error = (logEntry: IEpSdkLogEntry): void => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name);
    EpSdkLogger.epSdkLoggerInstance.error(logEntry);
  }

  public static warn = (logEntry: IEpSdkLogEntry): void => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name);
    EpSdkLogger.epSdkLoggerInstance.warn(logEntry);
  }

  public static info = (logEntry: IEpSdkLogEntry): void => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name);
    EpSdkLogger.epSdkLoggerInstance.info(logEntry);
  }

  public static debug = (logEntry: IEpSdkLogEntry): void => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name);
    EpSdkLogger.epSdkLoggerInstance.debug(logEntry);
  }

  public static trace = (logEntry: IEpSdkLogEntry): void => {
    if(EpSdkLogger.epSdkLoggerInstance === undefined) throw new EpSdkLoggerNotInitializedError(EpSdkLogger.name);
    EpSdkLogger.epSdkLoggerInstance.trace(logEntry);
  }

}


