import { EpSdkApiContentError, EpSdkInternalTaskError } from "../utils/EpSdkErrors";
import { EpSdkLogger } from "../utils/EpSdkLogger";
import { EEpSdkLoggerCodes } from "../utils/EpSdkLoggerCodes";
import {
  Application,
  ApplicationResponse,
  ApplicationsService,
  CustomAttributeDefinition,
  CustomAttributeDefinitionResponse,
  CustomAttributeDefinitionsService
} from '@solace-labs/ep-openapi-node';
import EpSdkApplicationsService from "../services/EpSdkApplicationsService";
import { 
  EpSdkTask,
  IEpSdkTask_Config, 
  IEpSdkTask_CreateFuncReturn, 
  IEpSdkTask_DeleteFuncReturn, 
  IEpSdkTask_EpObjectKeys, 
  IEpSdkTask_ExecuteReturn, 
  IEpSdkTask_GetFuncReturn, 
  IEpSdkTask_IsUpdateRequiredFuncReturn, 
  IEpSdkTask_Keys, 
  IEpSdkTask_UpdateFuncReturn
} from "./EpSdkTask";
import { EEpSdkObjectTypes } from '../types';
import { EEpSdkCustomAttributeEntityTypes } from "../types/EpSdkObjectTypes";
import EpSdkCustomAttributeDefinitionsService from "../services/EpSdkCustomAttributeDefinitionsService";


export type TEpSdkCustomAttributeDefinitionTask_Settings = Partial<Pick<CustomAttributeDefinition, "valueType">> & Required<Pick<CustomAttributeDefinition, "associatedEntityTypes">>;
type TEpSdkCustomAttributeDefinitionTask_CompareObject = TEpSdkCustomAttributeDefinitionTask_Settings;

export interface IEpSdkCustomAttributeDefinitionTask_Config extends IEpSdkTask_Config {
  attributeName: string;
  customAttributeDefinitionObjectSettings: TEpSdkCustomAttributeDefinitionTask_Settings;
}
export interface IEpSdkCustomAttributeDefinitionTask_Keys extends IEpSdkTask_Keys {
  attributeName: string;
}
export interface IEpSdkCustomAttributeDefinitionTask_GetFuncReturn extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: CustomAttributeDefinition | undefined;
}
export interface IEpSdkCustomAttributeDefinitionTask_CreateFuncReturn extends Omit<IEpSdkTask_CreateFuncReturn, "epObject" > {
  epObject: CustomAttributeDefinition;
}
export interface IEpSdkCustomAttributeDefinitionTask_UpdateFuncReturn extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: CustomAttributeDefinition;
}
export interface IEpSdkCustomAttributeDefinitionTask_DeleteFuncReturn extends Omit<IEpSdkTask_DeleteFuncReturn, "epObject"> {
  epObject: CustomAttributeDefinition;
}
export interface IEpSdkCustomAttributeDefinitionTask_ExecuteReturn extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: CustomAttributeDefinition;
}

/**
 * @category Tasks
 */
export class EpSdkCustomAttributeDefinitionTask extends EpSdkTask {

  private readonly Empty_IEpSdkCustomAttributeDefinitionTask_GetFuncReturn: IEpSdkCustomAttributeDefinitionTask_GetFuncReturn = {
    epObjectKeys: this.getDefaultEpObjectKeys(),
    epObject: undefined,
    epObjectExists: false  
  };
  private readonly Default_TEpSdkCustomAttributeDefinitionTask_Settings: Required<TEpSdkCustomAttributeDefinitionTask_Settings> = {
    valueType: CustomAttributeDefinition.valueType.STRING,
    associatedEntityTypes: []
  }
  private getTaskConfig(): IEpSdkCustomAttributeDefinitionTask_Config { 
    return this.epSdkTask_Config as IEpSdkCustomAttributeDefinitionTask_Config; 
  }
  private createObjectSettings(): Required<TEpSdkCustomAttributeDefinitionTask_Settings> {
    return {
      ...this.Default_TEpSdkCustomAttributeDefinitionTask_Settings,
      ...this.getTaskConfig().customAttributeDefinitionObjectSettings,
    };
  }

  constructor(taskConfig: IEpSdkCustomAttributeDefinitionTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkTask_EpObjectKeys {
    return {
      epObjectId: 'undefined',
      epObjectType: EEpSdkObjectTypes.CUSTOM_ATTRIBUTE_DEFINITION,
    };
  };

  protected getEpObjectKeys(epObject: CustomAttributeDefinition | undefined): IEpSdkTask_EpObjectKeys {
    const funcName = 'getEpObjectKeys';
    const logName = `${EpSdkCustomAttributeDefinitionTask.name}.${funcName}()`;
    
    if(epObject === undefined) return this.getDefaultEpObjectKeys();
    /* istanbul ignore next */
    if(epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epObject.id === undefined', {
      epObject: epObject
    });
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.id
    }
  }

  protected getTaskKeys(): IEpSdkCustomAttributeDefinitionTask_Keys {
    return {
      attributeName: this.getTaskConfig().attributeName,
    };
  }

  protected async getFunc(epSdkCustomAttributeDefinitionTask_Keys: IEpSdkCustomAttributeDefinitionTask_Keys): Promise<IEpSdkCustomAttributeDefinitionTask_GetFuncReturn> {
    const funcName = 'getFunc';
    const logName = `${EpSdkCustomAttributeDefinitionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET, module: this.constructor.name, details: {
      epSdkCustomAttributeDefinitionTask_Keys: epSdkCustomAttributeDefinitionTask_Keys
    }}));

    const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
      attributeName: epSdkCustomAttributeDefinitionTask_Keys.attributeName,
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET, module: this.constructor.name, details: {
      epSdkCustomAttributeDefinitionTask_Keys: epSdkCustomAttributeDefinitionTask_Keys,
      customAttributeDefinition: customAttributeDefinition ? customAttributeDefinition : 'undefined'
    }}));

    if(customAttributeDefinition === undefined) return this.Empty_IEpSdkCustomAttributeDefinitionTask_GetFuncReturn;

    const epSdkCustomAttributeDefinitionTask_GetFuncReturn: IEpSdkCustomAttributeDefinitionTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(customAttributeDefinition),
      epObject: customAttributeDefinition,
      epObjectExists: true,
    }
    return epSdkCustomAttributeDefinitionTask_GetFuncReturn;
  };

  protected async isUpdateRequiredFunc(epSdkCustomAttributeDefinitionTask_GetFuncReturn: IEpSdkCustomAttributeDefinitionTask_GetFuncReturn ): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = 'isUpdateRequiredFunc';
    const logName = `${EpSdkCustomAttributeDefinitionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED, module: this.constructor.name, details: {
      epSdkCustomAttributeDefinitionTask_GetFuncReturn: epSdkCustomAttributeDefinitionTask_GetFuncReturn
    }}));

    if(epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject === undefined');

    const existingObject: CustomAttributeDefinition = epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkCustomAttributeDefinitionTask_CompareObject = {
      associatedEntityTypes: existingObject.associatedEntityTypes ? existingObject.associatedEntityTypes : [],
      valueType: existingObject.valueType
    };
    const requestedCompareObject: TEpSdkCustomAttributeDefinitionTask_CompareObject = this.createObjectSettings();

    const epSdkTask_IsUpdateRequiredFuncReturn: IEpSdkTask_IsUpdateRequiredFuncReturn = this.create_IEpSdkTask_IsUpdateRequiredFuncReturn({ 
      existingObject: existingCompareObject, 
      requestedObject: requestedCompareObject, 
    });
    // // DEBUG:
    // if(epSdkTask_IsUpdateRequiredFuncReturn.isUpdateRequired) {
    //   EpSdkLogger.debug(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_DONE_IS_UPDATE_REQUIRED, module: this.constructor.name, details: {
    //     epSdkTask_Config: this.epSdkTask_Config,
    //     epSdkTask_IsUpdateRequiredFuncReturn: epSdkTask_IsUpdateRequiredFuncReturn
    //   }}));  
    //   throw new Error(`${logName}: check updates required`);
    // }
    return epSdkTask_IsUpdateRequiredFuncReturn;
  }

  protected async createFunc(): Promise<IEpSdkCustomAttributeDefinitionTask_CreateFuncReturn> {
    const funcName = 'createFunc';
    const logName = `${EpSdkCustomAttributeDefinitionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE, module: this.constructor.name }));

    const create: CustomAttributeDefinition = {
      ...this.createObjectSettings(),
      name: this.getTaskConfig().attributeName,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkApplicationTask_Config: this.getTaskConfig(),
      create: create,
    }}));

    if(this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getCreateFuncAction(),
        epObject: create,
        epObjectKeys: this.getEpObjectKeys({
          ...create,
          id: 'undefined'
        }),
      };
    }

    const customAttributeDefinitionResponse: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.createCustomAttributeDefinition({
      requestBody: create,
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkApplicationTask_Config: this.getTaskConfig(),
      create: create,
      customAttributeDefinitionResponse: customAttributeDefinitionResponse
    }}));

    /* istanbul ignore next */
    if(customAttributeDefinitionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'customAttributeDefinitionResponse.data === undefined', {
      epSdkCustomAttributeDefinitionTask_Config: this.getTaskConfig(),
      create: create,
      customAttributeDefinitionResponse: customAttributeDefinitionResponse
    });
    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: customAttributeDefinitionResponse.data,
      epObjectKeys: this.getEpObjectKeys(customAttributeDefinitionResponse.data)
    };
  }

  protected async updateFunc(epSdkCustomAttributeDefinitionTask_GetFuncReturn: IEpSdkCustomAttributeDefinitionTask_GetFuncReturn): Promise<IEpSdkCustomAttributeDefinitionTask_UpdateFuncReturn> {
    const funcName = 'updateFunc';
    const logName = `${EpSdkCustomAttributeDefinitionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE, module: this.constructor.name }));

    if(epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject === undefined');
    /* istanbul ignore next */
    if(epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id === undefined', {
      epObject: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject
    });

    const update: CustomAttributeDefinition = {
      ...this.createObjectSettings(),
      name: this.getTaskConfig().attributeName,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkCustomAttributeDefinitionTask_Config: this.getTaskConfig(),
      update: update,
    }}));

    if(this.isCheckmode()) {
      const wouldBe_EpObject: CustomAttributeDefinition = {
        ...epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject,
        ...update
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject)
      };
    }

    const customAttributeDefinitionResponse: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.updateCustomAttributeDefinition({
      id: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id,
      requestBody: update
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
      customAttributeDefinitionResponse: customAttributeDefinitionResponse,
    }}));

    /* istanbul ignore next */
    if(customAttributeDefinitionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'customAttributeDefinitionResponse.data === undefined', {
      customAttributeDefinitionResponse: customAttributeDefinitionResponse
    });
    const epSdkCustomAttributeDefinitionTask_UpdateFuncReturn: IEpSdkCustomAttributeDefinitionTask_UpdateFuncReturn = {
      epSdkTask_Action: this.getUpdateFuncAction(),
      epObject: customAttributeDefinitionResponse.data,
      epObjectKeys: this.getEpObjectKeys(customAttributeDefinitionResponse.data)
    };
    return epSdkCustomAttributeDefinitionTask_UpdateFuncReturn;
  }

  protected async deleteFunc(epSdkCustomAttributeDefinitionTask_GetFuncReturn: IEpSdkCustomAttributeDefinitionTask_GetFuncReturn): Promise<IEpSdkCustomAttributeDefinitionTask_DeleteFuncReturn> {
    const funcName = 'deleteFunc';
    const logName = `${EpSdkCustomAttributeDefinitionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_DELETE, module: this.constructor.name }));

    if(epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject === undefined');
    /* istanbul ignore next */
    if(epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id === undefined', {
      epObject: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject
    });

    if(this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject,
        epObjectKeys: this.getEpObjectKeys(epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject)
      };
    }

    const customAttributeDefinition: CustomAttributeDefinition = await EpSdkCustomAttributeDefinitionsService.deleteById({
      customAttributeDefinitionId: epSdkCustomAttributeDefinitionTask_GetFuncReturn.epObject.id,
    });

    const epSdkCustomAttributeDefinitionTask_DeleteFuncReturn: IEpSdkCustomAttributeDefinitionTask_DeleteFuncReturn = {
      epSdkTask_Action: this.getDeleteFuncAction(),
      epObject: customAttributeDefinition,
      epObjectKeys: this.getEpObjectKeys(customAttributeDefinition)
    };
    return epSdkCustomAttributeDefinitionTask_DeleteFuncReturn;
  }

  public async execute(): Promise<IEpSdkCustomAttributeDefinitionTask_ExecuteReturn> { 
    const epSdkTask_ExecuteReturn: IEpSdkCustomAttributeDefinitionTask_ExecuteReturn = await super.execute();
    return epSdkTask_ExecuteReturn;
  }

}
