
import { EEpSdkTask_Action, IEpSdkTask_Config, IEpSdkTask_CreateFuncReturn, IEpSdkTask_DeleteFuncReturn, IEpSdkTask_GetFuncReturn, IEpSdkTask_IsUpdateRequiredFuncReturn, IEpSdkTask_UpdateFuncReturn } from "./EpSdkTask";

export interface IEpSdkTask_TransactionLogData {
  taskTransactionId: string;
  epSdkTask_Config: IEpSdkTask_Config;
  epSdkTask_Action: EEpSdkTask_Action;
  epSdkTask_GetFuncReturn?: IEpSdkTask_GetFuncReturn;
  epSdkTask_CreateFuncReturn?: IEpSdkTask_CreateFuncReturn;
  epSdkTask_UpdateFuncReturn?: IEpSdkTask_UpdateFuncReturn;
  epSdkTask_DeleteFuncReturn?: IEpSdkTask_DeleteFuncReturn;
  epSdkTask_IsUpdateRequiredFuncReturn?: IEpSdkTask_IsUpdateRequiredFuncReturn;
}


export class EpSdkTask_TransactionLog {
  private epSdkTask_TransactionLogData: IEpSdkTask_TransactionLogData;

  constructor(taskTransactionId: string, epSdkTask_Config: IEpSdkTask_Config) {
    this.epSdkTask_TransactionLogData = {
      taskTransactionId: taskTransactionId,
      epSdkTask_Config: epSdkTask_Config,
      epSdkTask_Action: EEpSdkTask_Action.UNDEFINED,
    };
  }

  public getData(): IEpSdkTask_TransactionLogData { return this.epSdkTask_TransactionLogData; }
  
  public add_GetFuncReturn(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): void {
    this.epSdkTask_TransactionLogData.epSdkTask_GetFuncReturn = epSdkTask_GetFuncReturn;
  }

  public add_CreateFuncReturn(epSdkTask_CreateFuncReturn: IEpSdkTask_CreateFuncReturn): void {
    this.epSdkTask_TransactionLogData.epSdkTask_CreateFuncReturn = epSdkTask_CreateFuncReturn;
    this.epSdkTask_TransactionLogData.epSdkTask_Action = epSdkTask_CreateFuncReturn.epSdkTask_Action;
  }

  public add_UpdateFuncReturn(epSdkTask_UpdateFuncReturn: IEpSdkTask_UpdateFuncReturn): void {
    this.epSdkTask_TransactionLogData.epSdkTask_UpdateFuncReturn = epSdkTask_UpdateFuncReturn;
    this.epSdkTask_TransactionLogData.epSdkTask_Action = epSdkTask_UpdateFuncReturn.epSdkTask_Action;
  }

  public add_DeleteFuncReturn(epSdkTask_DeleteFuncReturn: IEpSdkTask_DeleteFuncReturn): void {
    this.epSdkTask_TransactionLogData.epSdkTask_DeleteFuncReturn = epSdkTask_DeleteFuncReturn;
    this.epSdkTask_TransactionLogData.epSdkTask_Action = epSdkTask_DeleteFuncReturn.epSdkTask_Action;
  }

  public add_isUpdateRequiredFuncReturn(epSdkTask_IsUpdateRequiredFuncReturn: IEpSdkTask_IsUpdateRequiredFuncReturn): void {
    this.epSdkTask_TransactionLogData.epSdkTask_IsUpdateRequiredFuncReturn = epSdkTask_IsUpdateRequiredFuncReturn;
  }

}
