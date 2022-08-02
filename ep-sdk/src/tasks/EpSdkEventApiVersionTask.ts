import { EpSdkConfig } from '../EpSdkConfig';
import { EpSdkApiContentError, EpSdkInternalTaskError } from '../EpSdkErrors';
import { EpSdkLogger } from '../EpSdkLogger';
import { EEpSdkLoggerCodes } from '../EpSdkLoggerCodes';
import EpSdkSemVerUtils from '../EpSdkSemVerUtils';
import { 
  eventApiVersion as EventApiVersion,
} from '../sep-openapi-node';
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
import EpSdkEventApiVersionsService from '../services/EpSdkEventApiVersionsService';

type TEpSdkEventApiVersionTask_Settings = Required<Pick<EventApiVersion, "description" | "displayName" | "stateId" | "producedEventVersionIds" | "consumedEventVersionIds" >>;
type TEpSdkEventApiVersionTask_CompareObject = Partial<TEpSdkEventApiVersionTask_Settings>;

export interface IEpSdkEventApiVersionTask_Config extends IEpSdkVersionTask_Config {
  applicationDomainId: string;
  eventApiId: string;
  eventApiVersionSettings: TEpSdkEventApiVersionTask_Settings;
}
export interface IEpSdkEventApiVersionTask_Keys extends IEpSdkTask_Keys {
  applicationDomainId: string;
  eventApiId: string;
}
export interface IEpSdkEventApiVersionTask_GetFuncReturn extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: EventApiVersion | undefined;
}
export interface IEpSdkEventApiVersionTask_CreateFuncReturn extends Omit<IEpSdkTask_CreateFuncReturn, "epObject"> {
  epObject: EventApiVersion;
}
export interface IEpSdkEventApiVersionTask_UpdateFuncReturn extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: EventApiVersion;
}
 export interface IEpSdkEventApiVersionTask_ExecuteReturn extends Omit<IEpSdkEnumTask_ExecuteReturn, "epObject"> {
  epObject: EventApiVersion;
}

export class EpSdkEventApiVersionTask extends EpSdkVersionTask {

  private readonly Empty_IEpSdkEventApiVersionTask_GetFuncReturn: IEpSdkEventApiVersionTask_GetFuncReturn = {
    epObjectKeys: this.getDefaultEpObjectKeys(),
    epObject: undefined,
    epObjectExists: false  
  };
  private readonly Default_TEpSdkEventApiVersionTask_Settings: Partial<TEpSdkEventApiVersionTask_Settings> = {
    description: `Created by ${EpSdkConfig.getAppName()}.`,
  }
  private getTaskConfig(): IEpSdkEventApiVersionTask_Config { 
    return this.epSdkTask_Config as IEpSdkEventApiVersionTask_Config; 
  }
  private createObjectSettings(): Partial<EventApiVersion> {
    return {
      ...this.Default_TEpSdkEventApiVersionTask_Settings,
      ...this.getTaskConfig().eventApiVersionSettings,
    };
  }

  constructor(taskConfig: IEpSdkEventApiVersionTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkVersionTask_EpObjectKeys {
    return {
      epObjectId: 'undefined',
      epObjectType: EEpSdkTask_EpObjectType.EVENT_API_VERSION,
      epVersionObjectId: 'undefined'
    };
  };

  protected getEpObjectKeys(epObject: EventApiVersion | undefined): IEpSdkVersionTask_EpObjectKeys {
    const funcName = 'getEpObjectKeys';
    const logName = `${EpSdkEventApiVersionTask.name}.${funcName}()`;
    
    if(epObject === undefined) return this.getDefaultEpObjectKeys();
    if(epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epObject.id === undefined', {
      epObject: epObject
    });
    if(epObject.eventApiId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epObject.eventApiId === undefined', {
      epObject: epObject
    });
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.eventApiId,
      epVersionObjectId: epObject.id,
    }
  }

  protected getTaskKeys(): IEpSdkEventApiVersionTask_Keys {
    return {
      eventApiId: this.getTaskConfig().eventApiId,
      applicationDomainId: this.getTaskConfig().applicationDomainId
    };
  }

  /**
   * Get the latest EventVersion.
   */
  protected async getFunc(epSdkEventApiVersionTask_Keys: IEpSdkEventApiVersionTask_Keys): Promise<IEpSdkEventApiVersionTask_GetFuncReturn> {
    const funcName = 'getFunc';
    const logName = `${EpSdkEventApiVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET, module: this.constructor.name, details: {
      epSdkEventApiVersionTask_Keys: epSdkEventApiVersionTask_Keys
    }}));

    const eventApiVersion: EventApiVersion | undefined = await EpSdkEventApiVersionsService.getLatestVersionForEventApiId({
      applicationDomainId: epSdkEventApiVersionTask_Keys.applicationDomainId,
      eventApiId: epSdkEventApiVersionTask_Keys.eventApiId,
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET, module: this.constructor.name, details: {
      epSdkEventApiVersionTask_Keys: epSdkEventApiVersionTask_Keys,
      eventApiVersion: eventApiVersion ? eventApiVersion : 'undefined'
    }}));

    if(eventApiVersion === undefined) return this.Empty_IEpSdkEventApiVersionTask_GetFuncReturn;

    const epSdkEventApiVersionTask_GetFuncReturn: IEpSdkEventApiVersionTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(eventApiVersion),
      epObject: eventApiVersion,
      epObjectExists: true,
    }
    return epSdkEventApiVersionTask_GetFuncReturn;
  };

  protected async isUpdateRequiredFunc(epSdkEventApiVersionTask_GetFuncReturn: IEpSdkEventApiVersionTask_GetFuncReturn ): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = 'isUpdateRequired';
    const logName = `${EpSdkEventApiVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED, module: this.constructor.name, details: {
      epSdkEventApiVersionTask_GetFuncReturn: epSdkEventApiVersionTask_GetFuncReturn
    }}));

    if(epSdkEventApiVersionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkEventApiVersionTask_GetFuncReturn.epObject === undefined');

    const existingObject: EventApiVersion = epSdkEventApiVersionTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkEventApiVersionTask_CompareObject = {
      description: existingObject.description,
      displayName: existingObject.displayName,
      stateId: existingObject.stateId,
      producedEventVersionIds: existingObject.producedEventVersionIds,
      consumedEventVersionIds: existingObject.consumedEventVersionIds,
    };
    const requestedCompareObject: TEpSdkEventApiVersionTask_CompareObject = this.createObjectSettings();

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
   * Create a new EventVersion
   */
  protected async createFunc(): Promise<IEpSdkEventApiVersionTask_CreateFuncReturn> {
    const funcName = 'createFunc';
    const logName = `${EpSdkEventApiVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE, module: this.constructor.name }));

    const create: EventApiVersion = {
      ...this.createObjectSettings(),
      eventApiId: this.getTaskConfig().eventApiId,
      version: this.initialVersionString,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkEventApiVersionTask_Config: this.getTaskConfig(),
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

    const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.createEventApiVersion({ 
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      eventApiId: this.getTaskConfig().eventApiId,
      eventApiVersion: create,
      targetLifecycleStateId: this.getTaskConfig().eventApiVersionSettings.stateId,
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      create: create,
      eventApiVersion: eventApiVersion
    }}));

    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: eventApiVersion,
      epObjectKeys: this.getEpObjectKeys(eventApiVersion)
    };
  }

  /**
   * Creates a new EventApiVersion with bumped version number.
   */
  protected async updateFunc(epSdkEventApiVersionTask_GetFuncReturn: IEpSdkEventApiVersionTask_GetFuncReturn): Promise<IEpSdkEventApiVersionTask_UpdateFuncReturn> {
    const funcName = 'updateFunc';
    const logName = `${EpSdkEventApiVersionTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE, module: this.constructor.name }));

    if(epSdkEventApiVersionTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkEventApiVersionTask_GetFuncReturn.epObject === undefined');
    if(epSdkEventApiVersionTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEventApiVersionTask_GetFuncReturn.epObject.id === undefined', {
      epObject: epSdkEventApiVersionTask_GetFuncReturn.epObject
    });
    if(epSdkEventApiVersionTask_GetFuncReturn.epObject.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEventApiVersionTask_GetFuncReturn.epObject.version === undefined', {
      epObject: epSdkEventApiVersionTask_GetFuncReturn.epObject
    });

    // getFuncReturn has the latest version object

    const update: EventApiVersion = {
      ...this.createObjectSettings(),
      eventApiId: epSdkEventApiVersionTask_GetFuncReturn.epObject.id,
      version: EpSdkSemVerUtils.createNextVersion({
        fromVersionString: epSdkEventApiVersionTask_GetFuncReturn.epObject.version,
        strategy: this.getTaskConfig().epSdk_VersionStrategy,
      })
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
    }}));

    if(this.isCheckmode()) {
      const wouldBe_EpObject: EventApiVersion = {
        ...epSdkEventApiVersionTask_GetFuncReturn.epObject,
        ...update
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject)
      };
    }

    const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.createEventApiVersion({
      applicationDomainId: this.getTaskConfig().applicationDomainId,      
      eventApiId: this.getTaskConfig().eventApiId,
      eventApiVersion: update,
      targetLifecycleStateId: this.getTaskConfig().eventApiVersionSettings.stateId
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
      eventApiVersion: eventApiVersion,
    }}));

    const epSdkEventApiVersionTask_UpdateFuncReturn: IEpSdkEventApiVersionTask_UpdateFuncReturn = {
      epSdkTask_Action: this.getUpdateFuncAction(),
      epObject: eventApiVersion,
      epObjectKeys: this.getEpObjectKeys(eventApiVersion)
    };
    return epSdkEventApiVersionTask_UpdateFuncReturn;
  }

  public async execute(): Promise<IEpSdkEventApiVersionTask_ExecuteReturn> { 
    const epSdkTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await super.execute();
    return epSdkTask_ExecuteReturn;
  }

}
