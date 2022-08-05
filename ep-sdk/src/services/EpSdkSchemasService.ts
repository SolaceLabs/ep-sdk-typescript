import { EpSdkApiContentError, EpSdkServiceError } from '../EpSdkErrors';
import { EpSdkLogger } from '../EpSdkLogger';
import { EEpSdkLoggerCodes } from '../EpSdkLoggerCodes';
import { 
  SchemaObject,
  SchemaResponse,
  SchemasResponse,
  SchemasService,
} from '@solace-labs/ep-openapi-node';
import { EpSdkService } from './EpSdkService';

export enum EEpSdkSchemaType {
  JSON_SCHEMA = "jsonSchema"
}
export enum EEpSdkSchemaContentType {
  APPLICATION_JSON = "json"
}

class EpSdkSchemasService extends EpSdkService {
  
  public getByName = async({ schemaName, applicationDomainId }:{
    schemaName: string;
    applicationDomainId: string;
  }): Promise<SchemaObject | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkSchemasService.name}.${funcName}()`;

    const schemasResponse: SchemasResponse = await SchemasService.getSchemas({
      applicationDomainId: applicationDomainId,
      name: schemaName
    })

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      schemasResponse: schemasResponse
    }}));

    if(schemasResponse.data === undefined || schemasResponse.data.length === 0) return undefined;
    if(schemasResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name,'schemasResponse.data.length > 1', {    
      schemasResponse: schemasResponse
    });
    const epSchemaObject: SchemaObject = schemasResponse.data[0];
    return epSchemaObject;
  }

  public getById = async({ schemaId, applicationDomainId }:{
    schemaId: string;
    applicationDomainId: string;
  }): Promise<SchemaObject> => {
    const funcName = 'getById';
    const logName = `${EpSdkSchemasService.name}.${funcName}()`;

    applicationDomainId;

    const schemaResponse: SchemaResponse = await  SchemasService.getSchema({
      id: schemaId
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      schemaResponse: schemaResponse
    }}));

    if(schemaResponse.data === undefined) {
      throw new EpSdkApiContentError(logName, this.constructor.name, "schemaResponse.data === undefined", {
        schemaId: schemaId
      });
    }
    const epSchemaObject: SchemaObject = schemaResponse.data;
    return epSchemaObject;  
  }

  public deleteById = async({ schemaId, applicationDomainId }:{
    schemaId: string;
    applicationDomainId: string;
  }): Promise<SchemaObject> => {
    const funcName = 'deleteById';
    const logName = `${EpSdkSchemasService.name}.${funcName}()`;

    const epSchemaObject: SchemaObject = await this.getById({ 
      applicationDomainId: applicationDomainId,
      schemaId: schemaId,
     });

    const xvoid: void = await SchemasService.deleteSchema({ 
      id: schemaId,
    });

    return epSchemaObject;
  }

  public deleteByName = async({ applicationDomainId, schemaName }: {
    schemaName: string;
    applicationDomainId: string;
  }): Promise<SchemaObject> => {
    const funcName = 'deleteByName';
    const logName = `${EpSdkSchemasService.name}.${funcName}()`;
    
    const epSchemaObject: SchemaObject | undefined = await this.getByName({ 
      applicationDomainId: applicationDomainId,
      schemaName: schemaName,
     });
    if(epSchemaObject === undefined) throw new EpSdkServiceError(logName, this.constructor.name, "epSchemaObject === undefined", {
      applicationDomainId: applicationDomainId,
      schemaName: schemaName
    });
    if(epSchemaObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSchemaObject.id === undefined', {
      epSchemaObject: epSchemaObject,
    });
    const epSchemaObjectDeleted: SchemaObject = await this.deleteById({ 
      applicationDomainId: applicationDomainId,
      schemaId: epSchemaObject.id
     });
    return epSchemaObjectDeleted;
  }


}

export default new EpSdkSchemasService();

