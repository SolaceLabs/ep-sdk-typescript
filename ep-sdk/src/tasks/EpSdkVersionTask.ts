import { EpSdkFeatureNotSupportedError, EpSdkInvalidSemVerStringError } from "../EpSdkErrors";
import EpSdkSemVerUtils, { EEpSdk_VersionStrategy } from "../EpSdkSemVerUtils";
import { 
  EEpSdkTask_Action, 
  EpSdkTask, 
  IEpSdkTask_Config, 
  IEpSdkTask_DeleteFuncReturn, 
  IEpSdkTask_EpObjectKeys, 
  IEpSdkTask_GetFuncReturn 
} from "./EpSdkTask";

export interface IEpSdkVersionTask_Config extends IEpSdkTask_Config {
  initialVersionString?: string;
  epSdk_VersionStrategy: EEpSdk_VersionStrategy;
}
export interface IEpSdkVersionTask_EpObjectKeys extends IEpSdkTask_EpObjectKeys {
  epVersionObjectId: string;
}

export abstract class EpSdkVersionTask extends EpSdkTask {
  private Default_InitialVersionString: string = '1.0.0';
  protected initialVersionString: string;

  constructor(epSdkVersionTask_Config: IEpSdkVersionTask_Config) {
    super(epSdkVersionTask_Config);
    if(epSdkVersionTask_Config.initialVersionString === undefined) this.initialVersionString = this.Default_InitialVersionString;
    else this.initialVersionString = epSdkVersionTask_Config.initialVersionString;
  }

  protected async validateTaskConfig(): Promise<void> {
    const funcName = 'validateTaskConfig';
    const logName = `${EpSdkVersionTask.name}.${funcName}()`;
    const xvoid: void = await super.validateTaskConfig();
    if(!EpSdkSemVerUtils.isSemVerFormat({ versionString: this.initialVersionString })) throw new EpSdkInvalidSemVerStringError(logName, this.constructor.name, undefined, this.initialVersionString);
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
