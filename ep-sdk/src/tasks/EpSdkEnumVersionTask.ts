import { EpSdkConfig } from '../EpSdkConfig';
import { EpSdkApiContentError, EpSdkInternalTaskError } from '../EpSdkErrors';
import { EpSdkLogger } from '../EpSdkLogger';
import { EEpSdkLoggerCodes } from '../EpSdkLoggerCodes';
import EpSdkSemVerUtils from '../EpSdkSemVerUtils';
import { 
  EnumValue, 
  EnumVersion, 
} from '../sep-openapi-node';
import EpSdkEnumVersionsService from '../services/EpSdkEnumVersionsService';
import { IEpSdkEnumTask_ExecuteReturn } from './EpSdkEnumTask';
import { 
  EEpSdkTask_EpObjectType,
  IEpSdkTask_CreateFuncReturn, 
  IEpSdkTask_GetFuncReturn, 
  IEpSdkTask_IsUpdateRequiredFuncReturn, 
  IEpSdkTask_Keys, 
  IEpSdkTask_UpdateFuncReturn 
} from './EpSdkTask';
import { EpSdkVersionTask, IEpSdkVersionTask_Config, IEpSdkVersionTask_EpObjectKeys } from './EpSdkVersionTask';

type TEpSdkEnumVersionTask_Settings = Required<Pick<EnumVersion, "displayName" | "stateId">> & Pick<EnumVersion, "description">;
type TEpSdkEnumVersionTask_CompareObject = Partial<TEpSdkEnumVersionTask_Settings> & Pick<EnumVersion, "values">;

export interface IEpSdkEnumVersionTask_Config extends IEpSdkVersionTask_Config {
  applicationDomainId: string;
  enumId: string;
  enumVersionSettings: TEpSdkEnumVersionTask_Settings;
  enumValues: Array<string>;
}
export interface IEpSdkEnumVersionTask_Keys extends IEpSdkTask_Keys {
  applicationDomainId: string;
  enumId: string;
}
export interface IEpSdkEnumVersionTask_GetFuncReturn extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: EnumVersion | undefined;
}
export interface IEpSdkEnumVersionTask_CreateFuncReturn extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: EnumVersion;
}
export interface IEpSdkEnumVersionTask_UpdateFuncReturn extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: EnumVersion;
}
 export interface IEpSdkEnumVersionTask_ExecuteReturn extends Omit<IEpSdkEnumTask_ExecuteReturn, "epObject"> {
  epObject: EnumVersion;
}

export class EpSdkEnumVersionTask extends EpSdkVersionTask {

  private readonly Empty_IEpSdkEnumVersionTask_GetFuncReturn: IEpSdkEnumVersionTask_GetFuncReturn = {
    epObjectKeys: this.getDefaultEpObjectKeys(),
    epObject: undefined,
    epObjectExists: false  
  };
  private readonly Default_TEpSdkEnumVersionTask_Settings: Partial<TEpSdkEnumVersionTask_Settings> = {
    description: `Created by ${EpSdkConfig.getAppName()}.`,
  }
  private getTaskConfig(): IEpSdkEnumVersionTask_Config { 
    return this.epSdkTask_Config as IEpSdkEnumVersionTask_Config; 
  }
  private createEnumValueList(valueList: Array<string>): Array<EnumValue> {
    const enumValueList: Array<EnumValue> = [];
    valueList.forEach( (value: string) => {
      const enumValue: EnumValue = {
        label: value,
        value: value
      };
      enumValueList.push(enumValue);
    });
    return enumValueList;
  }
  private createObjectSettings(): Partial<EnumVersion> {
    return {
      ...this.Default_TEpSdkEnumVersionTask_Settings,
      ...this.getTaskConfig().enumVersionSettings,
      values: this.createEnumValueList(this.getTaskConfig().enumValues)
    };
  }

  constructor(taskConfig: IEpSdkEnumVersionTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkVersionTask_EpObjectKeys {
    return {
      epObjectId: 'undefined',
      epObjectType: EEpSdkTask_EpObjectType.ENUM_VERSION,
      epVersionObjectId: 'undefined'
    };
  };

  protected getEpObjectKeys(epObject: EnumVersion | undefined): IEpSdkVersionTask_EpObjectKeys {
    const funcName = 'getEpObjectKeys';
    const logName = `${EpSdkEnumVersionTask.name}.${funcName}()`;
    
    if(epObject === undefined) return this.getDefaultEpObjectKeys();
    if(epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epObject.id === undefined', {
      epObject: epObject
    });
    if(epObject.enumId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epObject.enumId === undefined', {
      epObject: epObject
    });
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.enumId,
      epVersionObjectId: epObject.id,
    }
  }

  protected getTaskKeys(): IEpSdkEnumVersionTask_Keys {
    return {
      enumId: this.getTaskConfig().enumId,
      applicationDomainId: this.getTaskConfig().applicationDomainId
    };
  }

  /**
   * Get the latest EnumVersion.
   */
  protected async getFunc(epSdkEnumVersionTask_Keys: IEpSdkEnumVersionTask_Keys): Promise<IEpSdkEnumVersionTask_GetFuncReturn> {
    const funcName = 'getFunc';
    const logName = `${EpSdkEnumVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET, module: this.constructor.name, details: {
      epSdkEnumVersionTask_Keys: epSdkEnumVersionTask_Keys
    }}));

    const enumVersion: EnumVersion | undefined = await EpSdkEnumVersionsService.getLatestVersionForEnumId({
      applicationDomainId: epSdkEnumVersionTask_Keys.applicationDomainId,
      enumId: epSdkEnumVersionTask_Keys.enumId,
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET, module: this.constructor.name, details: {
      epSdkEnumVersionTask_Keys: epSdkEnumVersionTask_Keys,
      enumVersion: enumVersion ? enumVersion : 'undefined'
    }}));

    if(enumVersion === undefined) return this.Empty_IEpSdkEnumVersionTask_GetFuncReturn;

    const epSdkEnumVersionTask_GetFuncReturn: IEpSdkEnumVersionTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(enumVersion),
      epObject: enumVersion,
      epObjectExists: true,
    }
    return epSdkEnumVersionTask_GetFuncReturn;
  };

  private createCompareEnumValueList_From_EP({ epEnumValueList}:{
    epEnumValueList?: Array<EnumValue>;
  }): Array<EnumValue> {
    if(epEnumValueList === undefined) return [];
    return epEnumValueList.map( (epEnumValue: EnumValue) => {
      return {
        label: epEnumValue.label,
        value: epEnumValue.value
      }
    });
  }

  protected async isUpdateRequiredFunc(epSdkEnumVersionTask_GetFuncReturn: IEpSdkEnumVersionTask_GetFuncReturn ): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = 'isUpdateRequired';
    const logName = `${EpSdkEnumVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED, module: this.constructor.name, details: {
      epSdkEnumVersionTask_GetFuncReturn: epSdkEnumVersionTask_GetFuncReturn
    }}));

    if(epSdkEnumVersionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkEnumVersionTask_GetFuncReturn.epObject === undefined');

    const existingObject: EnumVersion = epSdkEnumVersionTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkEnumVersionTask_CompareObject = {
      description: existingObject.description,
      displayName: existingObject.displayName,
      stateId: existingObject.stateId,
      values: this.createCompareEnumValueList_From_EP({ epEnumValueList: existingObject.values })
    };
    const requestedCompareObject: TEpSdkEnumVersionTask_CompareObject = this.createObjectSettings();

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
    //   throw new EpSdkInternalTaskError(logName, this.constructor.name, 'check updates required');
    // }
    return epSdkTask_IsUpdateRequiredFuncReturn;
  }

  /**
   * Create a new EnumVersion
   */
  protected async createFunc(): Promise<IEpSdkEnumVersionTask_CreateFuncReturn> {
    const funcName = 'createFunc';
    const logName = `${EpSdkEnumVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE, module: this.constructor.name }));

    const create: EnumVersion = {
      ...this.createObjectSettings(),
      enumId: this.getTaskConfig().enumId,
      version: this.initialVersionString,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkEnumVersionTask_Config: this.getTaskConfig(),
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

    const enumVersion: EnumVersion = await EpSdkEnumVersionsService.createEnumVersion({ 
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      enumId: this.getTaskConfig().enumId,
      enumVersion: create,
      targetLifecycleStateId: this.getTaskConfig().enumVersionSettings.stateId,
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      create: create,
      enumVersion: enumVersion
    }}));

    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: enumVersion,
      epObjectKeys: this.getEpObjectKeys(enumVersion)
    };
  }

  /**
   * Creates a new EnumVersion with bumped version number.
   */
  protected async updateFunc(epSdkEnumVersionTask_GetFuncReturn: IEpSdkEnumVersionTask_GetFuncReturn): Promise<IEpSdkEnumVersionTask_UpdateFuncReturn> {
    const funcName = 'updateFunc';
    const logName = `${EpSdkEnumVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE, module: this.constructor.name }));

    if(epSdkEnumVersionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkEnumVersionTask_GetFuncReturn.epObject === undefined');
    if(epSdkEnumVersionTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEnumVersionTask_GetFuncReturn.epObject.id === undefined', {
      epObject: epSdkEnumVersionTask_GetFuncReturn.epObject
    });
    if(epSdkEnumVersionTask_GetFuncReturn.epObject.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEnumVersionTask_GetFuncReturn.epObject.version === undefined', {
      epObject: epSdkEnumVersionTask_GetFuncReturn.epObject
    });

    // getFuncReturn has the latest version object

    const update: EnumVersion = {
      ...this.createObjectSettings(),
      enumId: epSdkEnumVersionTask_GetFuncReturn.epObject.id,
      version: EpSdkSemVerUtils.createNextVersion({
        fromVersionString: epSdkEnumVersionTask_GetFuncReturn.epObject.version,
        strategy: this.getTaskConfig().epSdk_VersionStrategy,
      })
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
    }}));

    if(this.isCheckmode()) {
      const wouldBe_EpObject: EnumVersion = {
        ...epSdkEnumVersionTask_GetFuncReturn.epObject,
        ...update
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject)
      };
    }

    const enumVersion: EnumVersion = await EpSdkEnumVersionsService.createEnumVersion({
      applicationDomainId: this.getTaskConfig().applicationDomainId,      
      enumId: this.getTaskConfig().enumId,
      enumVersion: update,
      targetLifecycleStateId: this.getTaskConfig().enumVersionSettings.stateId
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
      enumVersion: enumVersion,
    }}));

    const epSdkEnumVersionTask_UpdateFuncReturn: IEpSdkEnumVersionTask_UpdateFuncReturn = {
      epSdkTask_Action: this.getUpdateFuncAction(),
      epObject: enumVersion,
      epObjectKeys: this.getEpObjectKeys(enumVersion)
    };
    return epSdkEnumVersionTask_UpdateFuncReturn;
  }

  public async execute(): Promise<IEpSdkEnumVersionTask_ExecuteReturn> { 
    const epSdkTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await super.execute();
    return epSdkTask_ExecuteReturn;
  }

}