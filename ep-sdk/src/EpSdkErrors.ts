// import CliConfig from "./CliConfig";
// import { CliLogger, ECliStatusCodes } from "./CliLogger";
// import { ApiError } from "@solace-iot-team/ep-sdk/sep-openapi-node";

import { EpSdkLogger } from "./EpSdkLogger";
import { ApiError } from "./sep-openapi-node";

enum ELoggerCodes {
  EP_SDK_INTERNAL_ERROR = "EP_SDK_INTERNAL_ERROR"
}
export class EpSdkErrorFactory {
  public static createError = (e: any, logName: string): EpSdkError => {
    let epSdkError: EpSdkError;
    if (e instanceof EpSdkError ) epSdkError = e;
    else epSdkError = new EPSdkErrorFromError(e, logName);
    return epSdkError;
  }
}
export class EpSdkError extends Error {
  private internalStack: Array<string>;
  private internalLogName: string;
  private internalMessage: string;
  private readonly baseName: string = EpSdkError.name;

  private createArrayFromStack = (stack: any): Array<string> => {
    return stack.split('\n');
  }

  constructor(internalLogName: string, internalMessage?: string) {
    super(internalMessage?internalMessage:internalLogName);
    this.name = this.constructor.name;
    this.internalLogName = internalLogName;
    this.internalStack = this.createArrayFromStack(this.stack);
  }

  public toString = (): string => {
    return JSON.stringify(this.toObject(), null, 2);
  }

  public toObject = (): any => {
    const funcName = 'toObject';
    const logName = `${EpSdkError.name}.${funcName}()`;
    try {
      return JSON.parse(JSON.stringify(this));
    } catch (e: any) {
      EpSdkLogger.error(EpSdkLogger.createLogEntry(logName, { code: ELoggerCodes.EP_SDK_INTERNAL_ERROR, message: `JSON.parse error`, details: { name: e.name, message: e.message } }));    
      return {
        internalLogName: this.internalLogName,
        internalMessage: this.internalMessage ? this.internalMessage : `JSON.parse error: ${e.name}: ${e.message}`,
        internalStack: this.internalStack
      }
    }
  }
}

export class EPSdkErrorFromError extends EpSdkError {
  protected static DefaultDescription = 'EPSdkError From Error';
  private originalError: {
    name: string,
    errors: any,
    status: number
  }
  constructor(internalLogName: string, originalError: any) {
    super(internalLogName, `${EPSdkErrorFromError}: ${originalError.message}`);
    this.originalError = {
      name: originalError.name,
      errors: originalError.errors || [{ message: originalError.message }],
      status: originalError.status
    }
  }
}

/**
 * Use when catching an ApiError to wrap into an EpSdkError.
 */
export class EpSdkErrorFromSEPApiError extends EpSdkError {
  protected static DefaultDescription = 'EP Api Error';
  private apiError: ApiError;
  constructor(internalLogName: string, internalMessage: string = EpSdkErrorFromSEPApiError.DefaultDescription, apiError: ApiError) {
    super(internalLogName, internalMessage);
    this.apiError = apiError;
  }
}

/**
 * Use when EP Api behaves unexpectedly or not according to spec.
 * 
 * @example
 * throw new EpSdkApiContentError(logName, "applicationDomainResponse.data === undefined", {
 *    applicationDomainId: applicationDomainId
 *  });
 *
 */
export class EpSdkApiContentError extends EpSdkError {
  protected static DefaultDescription = 'EP Api Content Error';
  private details: any;
  constructor(internalLogName: string, message: string = EpSdkApiContentError.DefaultDescription, details: any) {
    super(internalLogName, message);
    this.details = details;
  }
}

export class EpSdkLoggerNotInitializedError extends EpSdkError {
  protected static DefaultDescription = 'EP SDK Logger not initialized';
  constructor(internalLogName: string, message: string = EpSdkLoggerNotInitializedError.DefaultDescription) {
    super(internalLogName, message);
  }
}

export class EpSdkAbstractMethodError extends EpSdkError {
  protected static DefaultDescription = 'EP SDK abstract method call';
  private className: string;
  private methodName: string;
  constructor(internalLogName: string, className: string, methodName: string) {
    super(internalLogName, EpSdkAbstractMethodError.DefaultDescription);
    this.className = className;
    this.methodName = methodName;
  }
}

export class EpSdkInternalTaskError extends EpSdkError {
  protected static DefaultDescription = 'EP SDK Internal Task Error';
  private cause: any;
  constructor(internalLogName: string, cause: any) {
    super(internalLogName, EpSdkInternalTaskError.DefaultDescription);
    this.cause = cause;
  }
}

export class EpSdkEpApiError extends EpSdkError {
  protected static DefaultDescription = 'EP Api Error';
  private apiError: ApiError;
  constructor(internalLogName: string, apiError: ApiError) {
    super(internalLogName, EpSdkEpApiError.DefaultDescription);
    this.apiError = apiError;
  }
}

/**
 * Use when an error occurred using a service.
 */
export class EpSdkServiceError extends EpSdkError {
  protected static DefaultDescription = 'EP Sdk Service Error';
  private details: any;
  constructor(internalLogName: string, message: string = EpSdkServiceError.DefaultDescription, details: any) {
    super(internalLogName, message);
    this.details = details;
  }
}

