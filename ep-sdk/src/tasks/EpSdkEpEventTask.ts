import { EpSdkApiContentError, EpSdkInternalTaskError } from "../EpSdkErrors";
import { EpSdkLogger } from "../EpSdkLogger";
import { EEpSdkLoggerCodes } from "../EpSdkLoggerCodes";
import { 
  Event as EpEvent,
  EventResponse,
  EventsService,
} from '../sep-openapi-node';
import { 
  EEpSdkTask_EpObjectType,
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

type TEpSdkEpEventTask_Settings = Partial<Pick<SchemaObject, "shared"  | "contentType" | "schemaType">>;
type TEpSdkEpEventTask_CompareObject = TEpSdkEpEventTask_Settings;

export interface IEpSdkEpEventTask_Config extends IEpSdkTask_Config {
  schemaName: string;
  applicationDomainId: string;
  schemaObjectSettings?: Partial<TEpSdkEpEventTask_Settings>;
}
export interface IEpSdkEpEventTask_Keys extends IEpSdkTask_Keys {
  schemaName: string;
  applicationDomainId: string;
}
export interface IEpSdkEpEventTask_GetFuncReturn extends Omit<IEpSdkTask_GetFuncReturn, "epObject"> {
  epObject: SchemaObject | undefined;
}
export interface IEpSdkEpEventTask_CreateFuncReturn extends Omit<IEpSdkTask_CreateFuncReturn, "epObject" > {
  epObject: SchemaObject;
}
export interface IEpSdkEpEventTask_UpdateFuncReturn extends Omit<IEpSdkTask_UpdateFuncReturn, "epObject"> {
  epObject: SchemaObject;
}
export interface IEpSdkEpEventTask_DeleteFuncReturn extends Omit<IEpSdkTask_DeleteFuncReturn, "epObject"> {
  epObject: SchemaObject;
}
export interface IEpSdkEpEventTask_ExecuteReturn extends Omit<IEpSdkTask_ExecuteReturn, "epObject"> {
  epObject: SchemaObject;
}

export class EpSdkEpEventTask extends EpSdkTask {

  private readonly Empty_IEpSdkEpEventTask_GetFuncReturn: IEpSdkEpEventTask_GetFuncReturn = {
    epObjectKeys: this.getDefaultEpObjectKeys(),
    epObject: undefined,
    epObjectExists: false  
  };
  private readonly Default_TEpSdkEpEventTask_Settings: TEpSdkEpEventTask_Settings = {
    shared: true,
    contentType: EEpSdkSchemaContentType.APPLICATION_JSON,
    schemaType: EEpSdkSchemaType.JSON_SCHEMA,
  }
  private getTaskConfig(): IEpSdkEpEventTask_Config { 
    return this.epSdkTask_Config as IEpSdkEpEventTask_Config; 
  }
  private createObjectSettings(): Partial<SchemaObject> {
    return {
      ...this.Default_TEpSdkEpEventTask_Settings,
      ...this.getTaskConfig().schemaObjectSettings,
    };
  }

  constructor(taskConfig: IEpSdkEpEventTask_Config) {
    super(taskConfig);
  }

  protected getDefaultEpObjectKeys(): IEpSdkTask_EpObjectKeys {
    return {
      epObjectId: 'undefined',
      epObjectType: EEpSdkTask_EpObjectType.SCHEMA_OBJECT,
    };
  };

  protected getEpObjectKeys(epObject: SchemaObject | undefined): IEpSdkTask_EpObjectKeys {
    const funcName = 'getEpObjectKeys';
    const logName = `${EpSdkEpEventTask.name}.${funcName}()`;
    
    if(epObject === undefined) return this.getDefaultEpObjectKeys();
    if(epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epObject.id === undefined', {
      epObject: epObject
    });
    return {
      ...this.getDefaultEpObjectKeys(),
      epObjectId: epObject.id
    }
  }

  protected getTaskKeys(): IEpSdkEpEventTask_Keys {
    return {
      schemaName: this.getTaskConfig().schemaName,
      applicationDomainId: this.getTaskConfig().applicationDomainId,
    };
  }

  protected async getFunc(epSdkEpEventTask_Keys: IEpSdkEpEventTask_Keys): Promise<IEpSdkEpEventTask_GetFuncReturn> {
    const funcName = 'getFunc';
    const logName = `${EpSdkEpEventTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_GET, module: this.constructor.name, details: {
      epSdkEpEventTask_Keys: epSdkEpEventTask_Keys
    }}));

    const schemaObject: SchemaObject | undefined = await EpSdkSchemasService.getByName({ 
      schemaName: epSdkEpEventTask_Keys.schemaName,
      applicationDomainId: epSdkEpEventTask_Keys.applicationDomainId
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_API_GET, module: this.constructor.name, details: {
      epSdkEpEventTask_Keys: epSdkEpEventTask_Keys,
      schemaObject: schemaObject ? schemaObject : 'undefined'
    }}));

    if(schemaObject === undefined) return this.Empty_IEpSdkEpEventTask_GetFuncReturn;

    const epSdkEpEventTask_GetFuncReturn: IEpSdkEpEventTask_GetFuncReturn = {
      epObjectKeys: this.getEpObjectKeys(schemaObject),
      epObject: schemaObject,
      epObjectExists: true,
    }
    return epSdkEpEventTask_GetFuncReturn;
  };

  protected async isUpdateRequiredFunc(epSdkEpEventTask_GetFuncReturn: IEpSdkEpEventTask_GetFuncReturn ): Promise<IEpSdkTask_IsUpdateRequiredFuncReturn> {
    const funcName = 'isUpdateRequiredFunc';
    const logName = `${EpSdkEpEventTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_IS_UPDATE_REQUIRED, module: this.constructor.name, details: {
      epSdkEpEventTask_GetFuncReturn: epSdkEpEventTask_GetFuncReturn
    }}));

    if(epSdkEpEventTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkEpEventTask_GetFuncReturn.epObject === undefined');

    const existingObject: SchemaObject = epSdkEpEventTask_GetFuncReturn.epObject;
    const existingCompareObject: TEpSdkEpEventTask_CompareObject = {
      shared: existingObject.shared,
      contentType: existingObject.contentType,
      schemaType: existingObject.schemaType
    }
    const requestedCompareObject: TEpSdkEpEventTask_CompareObject = this.createObjectSettings();

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
    //   throw new EpSdkInternalTaskError(logName, this.constructor.name,  'check updates required');
    // }
    return epSdkTask_IsUpdateRequiredFuncReturn;
  }

  protected async createFunc(): Promise<IEpSdkEpEventTask_CreateFuncReturn> {
    const funcName = 'createFunc';
    const logName = `${EpSdkEpEventTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_CREATE, module: this.constructor.name }));

    const create: SchemaObject = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      name: this.getTaskConfig().schemaName,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkEpEventTask_Config: this.getTaskConfig(),
      create: create,
    }}));

    // // DEBUG:
    // throw new EpSdkInternalTaskError(logName, this.constructor.name,  'check create object (settings)');
    
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

    const schemaResponse: SchemaResponse = await SchemasService.createSchema({
      requestBody: create
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_CREATE, module: this.constructor.name, details: {
      epSdkEpEventTask_Config: this.getTaskConfig(),
      create: create,
      schemaResponse: schemaResponse
    }}));

    if(schemaResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'schemaResponse.data === undefined', {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      create: create,
      schemaResponse: schemaResponse
    });
    return {
      epSdkTask_Action: this.getCreateFuncAction(),
      epObject: schemaResponse.data,
      epObjectKeys: this.getEpObjectKeys(schemaResponse.data)
    };
  }

  protected async updateFunc(epSdkEpEventTask_GetFuncReturn: IEpSdkEpEventTask_GetFuncReturn): Promise<IEpSdkEpEventTask_UpdateFuncReturn> {
    const funcName = 'updateFunc';
    const logName = `${EpSdkEpEventTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_UPDATE, module: this.constructor.name }));

    if(epSdkEpEventTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkEpEventTask_GetFuncReturn.epObject === undefined');
    if(epSdkEpEventTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEpEventTask_GetFuncReturn.epObject.id === undefined', {
      epObject: epSdkEpEventTask_GetFuncReturn.epObject
    });

    const update: SchemaObject = {
      ...this.createObjectSettings(),
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      name: this.getTaskConfig().schemaName,
    };

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkEpEventTask_Config: this.getTaskConfig(),
      update: update,
    }}));

    if(this.isCheckmode()) {
      const wouldBe_EpObject: SchemaObject = {
        ...epSdkEpEventTask_GetFuncReturn.epObject,
        ...update
      };
      return {
        epSdkTask_Action: this.getUpdateFuncAction(),
        epObject: wouldBe_EpObject,
        epObjectKeys: this.getEpObjectKeys(wouldBe_EpObject)
      };
    }

    const schemaResponse: SchemaResponse = await SchemasService.updateSchema({
      id: epSdkEpEventTask_GetFuncReturn.epObject.id,
      requestBody: update
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_UPDATE, module: this.constructor.name, details: {
      epSdkApplicationDomainTask_Config: this.getTaskConfig(),
      update: update,
      schemaResponse: schemaResponse,
    }}));

    if(schemaResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'schemaResponse.data === undefined', {
      schemaResponse: schemaResponse
    });
    const epSdkEpEventTask_UpdateFuncReturn: IEpSdkEpEventTask_UpdateFuncReturn = {
      epSdkTask_Action: this.getUpdateFuncAction(),
      epObject: schemaResponse.data,
      epObjectKeys: this.getEpObjectKeys(schemaResponse.data)
    };
    return epSdkEpEventTask_UpdateFuncReturn;
  }

  protected async deleteFunc(epSdkEpEventTask_GetFuncReturn: IEpSdkEpEventTask_GetFuncReturn): Promise<IEpSdkEpEventTask_DeleteFuncReturn> {
    const funcName = 'deleteFunc';
    const logName = `${EpSdkEpEventTask.name}.${funcName}()`;

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.TASK_EXECUTE_START_DELETE, module: this.constructor.name }));

    if(epSdkEpEventTask_GetFuncReturn.epObject === undefined) throw new EpSdkInternalTaskError(logName, this.constructor.name, 'epSdkEpEventTask_GetFuncReturn.epObject === undefined');
    if(epSdkEpEventTask_GetFuncReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEpEventTask_GetFuncReturn.epObject.id === undefined', {
      epObject: epSdkEpEventTask_GetFuncReturn.epObject
    });

    if(this.isCheckmode()) {
      return {
        epSdkTask_Action: this.getDeleteFuncAction(),
        epObject: epSdkEpEventTask_GetFuncReturn.epObject,
        epObjectKeys: this.getEpObjectKeys(epSdkEpEventTask_GetFuncReturn.epObject)
      };
    }

    const schemaObject: SchemaObject = await EpSdkSchemasService.deleteById({ 
      applicationDomainId: this.getTaskConfig().applicationDomainId,
      schemaId: epSdkEpEventTask_GetFuncReturn.epObject.id,
    });

    const epSdkEpEventTask_DeleteFuncReturn: IEpSdkEpEventTask_DeleteFuncReturn = {
      epSdkTask_Action: this.getDeleteFuncAction(),
      epObject: schemaObject,
      epObjectKeys: this.getEpObjectKeys(schemaObject)
    };
    return epSdkEpEventTask_DeleteFuncReturn;
  }

  public async execute(): Promise<IEpSdkEpEventTask_ExecuteReturn> { 
    const epSdkTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await super.execute();
    return epSdkTask_ExecuteReturn;
  }

}
