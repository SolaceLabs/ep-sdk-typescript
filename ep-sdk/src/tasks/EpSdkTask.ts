
import { EpSdkAbstractMethodError, EpSdkEpApiError, EpSdkError, EPSdkErrorFromError, EpSdkInternalTaskError } from "../EpSdkErrors";
import { EpSdkLogger } from "../EpSdkLogger";
import { EEpSdkLoggerCodes } from "../EpSdkLoggerCodes";
import { EpSdkUtils, IEpSdkDeepCompareResult, TEpSdkDeepDiffFromTo } from "../EpSdkUtils";
import { ApiError } from "../sep-openapi-node";

export enum EEpSdkTask_TargetState {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT"
}
export enum EEpSdkTask_Action {
  CREATE = "CREATE",
  CREATE_FIRST_VERSION = "CREATE_FIRST_VERSION",
  CREATE_NEW_VERSION = "CREATE_NEW_VERSION",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  NO_ACTION = "NO_ACTION"
}
export interface IEpSdkTask_TransactionConfig {
  groupTransactionId?: string;
  parentTransactionId?: string;
}
export interface IEpSdkTask_Config {
  epSdkTask_TargetState: EEpSdkTask_TargetState;
  checkmode?: boolean;
  epSdkTask_TransactionConfig: IEpSdkTask_TransactionConfig;
}
export interface IEpSdkTask_Keys {}
export interface IEpSdkTask_GetFuncReturn {
  documentExists: boolean;
  apiObject: any;
}
export interface IEpSdkTask_CreateFuncReturn {
  apiObject: any;
}
export interface IEpSdkTask_IsUpdateRequiredFuncReturn {
  isUpdateRequired: boolean;
  existingCompareObject: any;
  requestedCompareObject: any;
  difference: Record<string, TEpSdkDeepDiffFromTo> | undefined;
}
export interface IEpSdkTask_UpdateFuncReturn {
  apiObject: any;
}
export interface IEpSdkTask_DeleteFuncReturn {
  apiObject: any;
}
export interface IEpSdkTask_EpObjectId {
  epObjectType: string; 
  epObjectId: string; 
  epVersionObjectId?: string;
}
export interface IEpSdkTask_TransactionEntry extends IEpSdkTask_TransactionConfig {
  taskTransactionId: string;
  epSdkTask_Action: EEpSdkTask_Action;
  epSdkTask_EpObjectId: IEpSdkTask_EpObjectId;
}
export interface IEpSdkTask_ExecuteReturn {
  epSdkTask_Config: IEpSdkTask_Config;
  epSdkTask_TransactionEntry: IEpSdkTask_TransactionEntry;
  apiObject: any;
}
// export interface ICliTaskDeepCompareResult extends IDeepCompareResult  {  
// }


export abstract class EpSdkTask {
  private taskTransactionId: string;
  protected epSdkTask_Config: IEpSdkTask_Config;

  protected isCheckmode(): boolean {
    if(this.epSdkTask_Config.checkmode === undefined) return false;
    return this.epSdkTask_Config.checkmode;
  }

  protected prepareCompareObject4Output(obj: any): any {
    return EpSdkUtils.prepareCompareObject4Output(obj);
  }

  protected deepCompareObjects({ existingObject, requestedObject }:{
    existingObject: any;
    requestedObject: any;
  }): IEpSdkDeepCompareResult {
    return EpSdkUtils.deepCompareObjects({
      existingObject: existingObject,
      requestedObject: requestedObject
    });
  }

  // TODO: PARKED
  // protected create_ICliTaskIsUpdateRequiredReturn({ existingObject, requestedObject }:{
  //   existingObject: any;
  //   requestedObject: any;
  // }): ICliTaskIsUpdateRequiredReturn {
  //   const funcName = 'create_ICliTaskIsUpdateRequiredReturn';
  //   const logName = `${CliTask.name}.${funcName}()`;

  //   const cliTaskDeepCompareResult: ICliTaskDeepCompareResult = this.deepCompareObjects({ existingObject: existingObject, requestedObject: requestedObject });
  //   const cliTaskIsUpdateRequiredReturn: ICliTaskIsUpdateRequiredReturn = {
  //     isUpdateRequired: !cliTaskDeepCompareResult.isEqual,
  //     existingCompareObject: this.prepareCompareObject4Output(existingObject),
  //     requestedCompareObject: this.prepareCompareObject4Output(requestedObject),
  //     difference: cliTaskDeepCompareResult.difference
  //   };
  //   CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.EXECUTING_TASK_IS_UPDATE_REQUIRED, details: {
  //     ...cliTaskIsUpdateRequiredReturn
  //   }}));

  //   return cliTaskIsUpdateRequiredReturn;
  // }

  constructor(epSdkTask_Config: IEpSdkTask_Config) {
    this.epSdkTask_Config = epSdkTask_Config;
    this.epSdkTask_Config.checkmode = this.isCheckmode();
    this.taskTransactionId = EpSdkUtils.getUUID();
  }

  protected abstract getTaskKeys(): IEpSdkTask_Keys;

  protected async getFunc(epSdkTask_Keys: IEpSdkTask_Keys): Promise<IEpSdkTask_GetFuncReturn> {
    const funcName = 'getFunc';
    const logName = `${EpSdkTask.name}.${funcName}()`;
    epSdkTask_Keys;
    throw new EpSdkAbstractMethodError(logName, EpSdkTask.name, funcName);
  };

  protected async createFunc(): Promise<IEpSdkTask_CreateFuncReturn> {
    const funcName = 'createFunc';
    const logName = `${EpSdkTask.name}.${funcName}()`;
    throw new EpSdkAbstractMethodError(logName, EpSdkTask.name, funcName);
  }

  protected async updateFunc(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_UpdateFuncReturn> {
    const funcName = 'updateFunc';
    const logName = `${EpSdkTask.name}.${funcName}()`;
    epSdkTask_GetFuncReturn;
    throw new EpSdkAbstractMethodError(logName, EpSdkTask.name, funcName);
  }

  protected async deleteFunc(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_DeleteFuncReturn> {
    const funcName = 'deleteFunc';
    const logName = `${EpSdkTask.name}.${funcName}()`;
    epSdkTask_GetFuncReturn;
    throw new EpSdkAbstractMethodError(logName, EpSdkTask.name, funcName);
  }

  protected async isUpdateRequiredFunc({ epSdkTask_GetFuncReturn }:{
    epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn;
  }): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = 'isUpdateRequiredFunc';
    const logName = `${EpSdkTask.name}.${funcName}()`;
    epSdkTask_GetFuncReturn;
    throw new EpSdkAbstractMethodError(logName, EpSdkTask.name, funcName);
  }

  private async createFuncCall(): Promise<IEpSdkTask_CreateFuncReturn> {
    if(!this.isCheckmode()) return await this.createFunc();

    TODO: create the transaction log here

    return {
      apiObject: {},
    };
  }

  private async updateFuncCall(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_UpdateFuncReturn> {
    if(!this.isCheckmode()) return await this.updateFunc(epSdkTask_GetFuncReturn);
    return {
      apiObject: {},
    }
  }

  private async deleteFuncCall(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_DeleteFuncReturn> {
    if(!this.isCheckmode()) return await this.deleteFunc(epSdkTask_GetFuncReturn);
    return {
      apiObject: {},
    }
  }

  // protected create_CreateFuncActionLog(): ICliTaskActionLog {
  //   return {
  //     action: ECliTaskAction.CREATE,
  //     details: undefined
  //   };
  // }

  // protected create_UpdateFuncActionLog({ cliTaskIsUpdateRequiredReturn }:{
  //   cliTaskIsUpdateRequiredReturn: ICliTaskIsUpdateRequiredReturn;
  // }): ICliTaskActionLog {
  //   return {
  //     action: ECliTaskAction.UPDATE,
  //     details: cliTaskIsUpdateRequiredReturn
  //   };
  // }

  // protected create_NothingToDoActionLog(): ICliTaskActionLog {
  //   return {
  //     action: ECliTaskAction.NOTHING_TO_DO,
  //     details: undefined
  //   };
  // }

  private async executePresent(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_ExecuteReturn> {
    const funcName = 'executePresent';
    const logName = `${EpSdkTask.name}.${funcName}()`;

    if(!epSdkTask_GetFuncReturn.documentExists) {
      const epSdkTask_CreateFuncReturn: IEpSdkTask_CreateFuncReturn = await this.createFuncCall();
      EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTED_CREATE, details: {
        epSdkTask_CreateFuncReturn: epSdkTask_CreateFuncReturn
      }}));
      return {
        epSdkTask_Config: this.epSdkTask_Config,
        epSdkTask_TransactionEntry: xxx,
        // actionLog: this.create_CreateFuncActionLog(),
        apiObject: epSdkTask_CreateFuncReturn.apiObject,
      };
    } 
    // check if update required
    const epSdkTask_IsUpdateRequiredFuncReturn: IEpSdkTask_IsUpdateRequiredFuncReturn = await this.isUpdateRequiredFunc({ 
      epSdkTask_GetFuncReturn: epSdkTask_GetFuncReturn 
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTED_IS_UPDATE_REQUIRED, details: {
      epSdkTask_IsUpdateRequiredFuncReturn: epSdkTask_IsUpdateRequiredFuncReturn
    }}));

    if(epSdkTask_IsUpdateRequiredFuncReturn.isUpdateRequired) {
      const epSdkTask_UpdateFuncReturn: IEpSdkTask_UpdateFuncReturn = await this.updateFuncCall(epSdkTask_GetFuncReturn);
      EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTED_UPDATE, details: {
        epSdkTask_UpdateFuncReturn: epSdkTask_UpdateFuncReturn
      }}));
      return {
        epSdkTask_Config: this.epSdkTask_Config,
        epSdkTask_TransactionEntry: xxx,
        // actionLog: this.create_UpdateFuncActionLog({ cliTaskIsUpdateRequiredReturn: cliTaskIsUpdateRequiredReturn }),
        apiObject: epSdkTask_UpdateFuncReturn.apiObject,
      }
    }
    // nothing to do
    return {
      epSdkTask_Config: this.epSdkTask_Config,
      epSdkTask_TransactionEntry: xxx,
      // actionLog: this.create_NothingToDoActionLog(),
      apiObject: epSdkTask_GetFuncReturn.apiObject,
    };
  }

  private async executeAbsent(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_ExecuteReturn> {
    const funcName = 'executeAbsent';
    const logName = `${EpSdkTask.name}.${funcName}()`;

    if(epSdkTask_GetFuncReturn.documentExists) {
      const epSdkTask_DeleteFuncReturn: IEpSdkTask_DeleteFuncReturn = await this.deleteFuncCall(epSdkTask_GetFuncReturn);
      EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTED_DELETE, details: {
        epSdkTask_DeleteFuncReturn: epSdkTask_DeleteFuncReturn
      }}));
      return {
        epSdkTask_Config: this.epSdkTask_Config,
        epSdkTask_TransactionEntry: xxx,
        // actionLog: this.create_CreateFuncActionLog(),
        apiObject: epSdkTask_DeleteFuncReturn.apiObject,
      };
    }
    // nothing to do
    return {
      epSdkTask_Config: this.epSdkTask_Config,
      epSdkTask_TransactionEntry: xxx,
      // actionLog: this.create_NothingToDoActionLog(),
      apiObject: epSdkTask_GetFuncReturn.apiObject,
    };
  }

  // protected async initializeTask(): Promise<void> {
  //   // do nothing, override in derived class
  // }

  protected async execute(): Promise<IEpSdkTask_ExecuteReturn> { 
    const funcName = 'execute';
    const logName = `${EpSdkTask.name}.${funcName}()`;

    try {
      EpSdkLogger.info(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START }));
      EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START, details: {
        epSdkTask_Config: this.epSdkTask_Config
      }}));

      // is this required?
      // const xvoid: void = await this.initializeTask();

      const epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn = await this.getFunc(this.getTaskKeys());
      EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTED_GET, details: {
        epSdkTask_GetFuncReturn: epSdkTask_GetFuncReturn
      }}));

      let epSdkTask_ExecuteReturn: IEpSdkTask_ExecuteReturn | undefined = undefined;
      switch(this.epSdkTask_Config.epSdkTask_TargetState) {
        case EEpSdkTask_TargetState.PRESENT:
          epSdkTask_ExecuteReturn = await this.executePresent(epSdkTask_GetFuncReturn);
          break;
        case EEpSdkTask_TargetState.ABSENT:
          epSdkTask_ExecuteReturn = await this.executeAbsent(epSdkTask_GetFuncReturn);
          break;
        default:
          EpSdkUtils.assertNever(logName, this.epSdkTask_Config.epSdkTask_TargetState);
      }

      EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_RESULT, details: {
        epSdkTask_ExecuteReturn: epSdkTask_ExecuteReturn ? epSdkTask_ExecuteReturn : 'undefined'
      }}));
      EpSdkLogger.info(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_DONE }));

      if(epSdkTask_ExecuteReturn === undefined) throw new EpSdkInternalTaskError(logName, 'epSdkTask_ExecuteReturn === undefined');

      return epSdkTask_ExecuteReturn;
      
    } catch(e: any) {
      if(e instanceof ApiError) throw new EpSdkEpApiError(logName, e);
      if(e instanceof EpSdkError) throw e;
      throw new EPSdkErrorFromError(logName, e);
    }

  }


}
