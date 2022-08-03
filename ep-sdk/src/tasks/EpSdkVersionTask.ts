import { EpSdkFeatureNotSupportedError, EpSdkInvalidSemVerStringError, EpSdkVersionTaskStrategyValidationError } from "../EpSdkErrors";
import EpSdkSemVerUtils, { EEpSdk_VersionStrategy } from "../EpSdkSemVerUtils";
import { 
  EEpSdkTask_Action, 
  EpSdkTask, 
  IEpSdkTask_Config, 
  IEpSdkTask_DeleteFuncReturn, 
  IEpSdkTask_EpObjectKeys, 
  IEpSdkTask_GetFuncReturn 
} from "./EpSdkTask";

export enum EEpSdk_VersionTaskStrategy {
  BUMP_MINOR = "bump_minor",
  BUMP_PATCH = "bump_patch",
  EXACT_VERSION = "exact_version"
}

export interface IEpSdkVersionTask_Config extends IEpSdkTask_Config {
  versionString?: string;
  versionStrategy?: EEpSdk_VersionTaskStrategy;
}
export interface IEpSdkVersionTask_EpObjectKeys extends IEpSdkTask_EpObjectKeys {
  epVersionObjectId: string;
}

export abstract class EpSdkVersionTask extends EpSdkTask {
  protected versionString: string = '1.0.0';
  protected versionStrategy: EEpSdk_VersionTaskStrategy = EEpSdk_VersionTaskStrategy.BUMP_PATCH;

  constructor(epSdkVersionTask_Config: IEpSdkVersionTask_Config) {
    super(epSdkVersionTask_Config);
    if(epSdkVersionTask_Config.versionString !== undefined) this.versionString = epSdkVersionTask_Config.versionString;
    if(epSdkVersionTask_Config.versionStrategy !== undefined) this.versionStrategy = epSdkVersionTask_Config.versionStrategy;
  }

  protected async validateTaskConfig(): Promise<void> {
    const funcName = 'validateTaskConfig';
    const logName = `${EpSdkVersionTask.name}.${funcName}()`;
    const xvoid: void = await super.validateTaskConfig();
    if(!EpSdkSemVerUtils.isSemVerFormat({ versionString: this.versionString })) throw new EpSdkInvalidSemVerStringError(logName, this.constructor.name, undefined, this.versionString);
  }

  protected createNextVersionWithStrategyValidation({ existingObjectVersionString }:{
    existingObjectVersionString: string;
  }): string {
    const funcName = 'createNextVersionWithStrategyValidation';
    const logName = `${EpSdkVersionTask.name}.${funcName}()`;

    if(this.versionStrategy === EEpSdk_VersionTaskStrategy.EXACT_VERSION) {
      // check if requrest versionString > existingObjectVersionString
      if(!EpSdkSemVerUtils.is_NewVersion_GreaterThan_OldVersion({
        newVersionString: this.versionString,
        oldVersionString: existingObjectVersionString
      })) {
        throw new EpSdkVersionTaskStrategyValidationError(logName, this.constructor.name, undefined, {
          versionString: this.versionString,
          versionStrategy: this.versionStrategy,
          existingVersionString: existingObjectVersionString,
          transactionLogData: this.epSdkTask_TransactionLog.getData(),
        });  
      }
      // return requested versionString
      return this.versionString;
    }
    return EpSdkSemVerUtils.createNextVersionByStrategy({
      fromVersionString: existingObjectVersionString,
      strategy: (this.versionStrategy as unknown) as EEpSdk_VersionStrategy,
    });
  }

  protected getCreateFuncAction(): EEpSdkTask_Action {
    if(this.isCheckmode()) return EEpSdkTask_Action.WOULD_CREATE_FIRST_VERSION;
    return EEpSdkTask_Action.CREATE_FIRST_VERSION;
  }

  protected getUpdateFuncAction(): EEpSdkTask_Action {
    if(this.isCheckmode()) return EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION;
    return EEpSdkTask_Action.CREATE_NEW_VERSION;
  }

  protected getDeleteFuncAction(): EEpSdkTask_Action {
    if(this.isCheckmode()) return EEpSdkTask_Action.WOULD_DELETE_VERSION;
    return EEpSdkTask_Action.DELETE_VERSION;
  }

  protected async deleteFunc(epSdkTask_GetFuncReturn: IEpSdkTask_GetFuncReturn): Promise<IEpSdkTask_DeleteFuncReturn> {
    const funcName = 'deleteFunc';
    const logName = `${EpSdkVersionTask.name}.${funcName}()`;
    epSdkTask_GetFuncReturn;
    throw new EpSdkFeatureNotSupportedError(logName, this.constructor.name, undefined, 'deleting a version object is not supported');
  }

}
