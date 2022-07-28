import { EEpSdkTask_Action, EpSdkTask, IEpSdkTask_Config } from "./EpSdkTask";

export abstract class EpSdkVersionTask extends EpSdkTask {

  constructor(epSdkTask_Config: IEpSdkTask_Config) {
    super(epSdkTask_Config);
  }

  protected getCreateFuncAction(): EEpSdkTask_Action {
    return EEpSdkTask_Action.CREATE_FIRST_VERSION;
  }

  protected getUpdateFuncAction(): EEpSdkTask_Action {
    return EEpSdkTask_Action.CREATE_NEW_VERSION;
  }

  protected getDeleteFuncAction(): EEpSdkTask_Action {
    return EEpSdkTask_Action.DELETE_VERSION;
  }


}
