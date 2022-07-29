import { EEpSdkTask_Action, EpSdkTask, IEpSdkTask_Config } from "./EpSdkTask";

export abstract class EpSdkVersionTask extends EpSdkTask {

  constructor(epSdkTask_Config: IEpSdkTask_Config) {
    super(epSdkTask_Config);
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


}
