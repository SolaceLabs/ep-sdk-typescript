import { EpSdkApiContentError } from "../utils/EpSdkErrors";
import {
  SchemaObject,
  SchemasService,
  SchemaVersion,
  SchemaVersionResponse,
  VersionedObjectStateChangeRequest
} from '@solace-labs/ep-openapi-node';
import EpSdkSchemasService from "./EpSdkSchemasService";
import { EpSdkVersionService } from "./EpSdkVersionService";
import { EpApiHelpers, T_EpMeta } from "../internal-utils/EpApiHelpers";

export class EpSdkSchemaVersionsService extends EpSdkVersionService {

  public getVersionByVersion = async ({ schemaId, schemaVersionString }: {
    schemaId: string;
    schemaVersionString: string;
  }): Promise<SchemaVersion | undefined> => {
    const funcName = 'getVersionByVersion';
    const logName = `${EpSdkSchemaVersionsService.name}.${funcName}()`;

    // EP_API_KAPUTT_TRICK
    // const schemaVersionResponse: SchemaVersionResponse = await SchemasService.getSchemaVersionsForSchema({
    //   schemaId: schemaId,
    //   versions: [schemaVersionString]
    // });
    // if(schemaVersionResponse.data === undefined) return undefined;
    // return schemaVersionResponse.data;

    const schemaVersionList: Array<SchemaVersion> = await this.getVersionsForSchemaId({ schemaId: schemaId });
    const found: SchemaVersion | undefined = schemaVersionList.find( (schemaVersion: SchemaVersion ) => {
      if(schemaVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'schemaVersion.version === undefined', {
        schemaVersion: schemaVersion
      });
      return schemaVersion.version === schemaVersionString;
    });
    return found;
  }

  public getVersionsForSchemaId = async ({ schemaId, pageSize = EpApiHelpers.MaxPageSize }: {
    schemaId: string;
    pageSize?: number; /** for testing */
  }): Promise<Array<SchemaVersion>> => {
    const funcName = 'getVersionsForSchemaId';
    const logName = `${EpSdkSchemaVersionsService.name}.${funcName}()`;

    const versionList: Array<SchemaVersion> = [];
    let nextPage: number | null = 1;

    while(nextPage !== null) {

      const versionsResponse: SchemaVersionResponse = await SchemasService.getSchemaVersionsForSchema({
        schemaId: schemaId,
        pageSize: pageSize,
        pageNumber: nextPage
      });
  
      // EP_API_KAPUTT_TRICK
      // TODO: EP API is wrong, data is actually an Array<SchemaVersion>
      const data: Array<SchemaVersion> | undefined = versionsResponse.data as Array<SchemaVersion> | undefined;
      if (data === undefined || data.length === 0) return [];

      versionList.push(...data);

      const meta: T_EpMeta = versionsResponse.meta as T_EpMeta;
      EpApiHelpers.validateMeta(meta);
      nextPage = meta.pagination.nextPage;

    }
    return versionList;
  }

  public getVersionsForSchemaName = async ({ schemaName, applicationDomainId }: {
    applicationDomainId: string;
    schemaName: string;
  }): Promise<Array<SchemaVersion>> => {
    const funcName = 'getVersionsForSchemaName';
    const logName = `${EpSdkSchemaVersionsService.name}.${funcName}()`;

    const schemaObject: SchemaObject | undefined = await EpSdkSchemasService.getByName({
      applicationDomainId: applicationDomainId,
      schemaName: schemaName
    });
    if (schemaObject === undefined) return [];
    if (schemaObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'schemaObject.id === undefined', {
      schemaObject: schemaObject
    });
    const schemaVersionList: Array<SchemaVersion> = await this.getVersionsForSchemaId({ schemaId: schemaObject.id });
    return schemaVersionList;
  }

  public getLatestVersionString = async ({ schemaId }: {
    schemaId: string;
  }): Promise<string | undefined> => {
    const funcName = 'getLatestVersionString';
    const logName = `${EpSdkSchemaVersionsService.name}.${funcName}()`;

    const schemaVersionList: Array<SchemaVersion> = await this.getVersionsForSchemaId({ schemaId: schemaId });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));
    const latestSchemaVersion: SchemaVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: schemaVersionList });
    if(latestSchemaVersion === undefined) return undefined;
    if(latestSchemaVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'latestSchemaVersion.version === undefined', {
      latestSchemaVersion: latestSchemaVersion
    });
    return latestSchemaVersion.version;
  }

  public getLatestVersionForSchemaId = async ({ schemaId, applicationDomainId }: {
    applicationDomainId: string;
    schemaId: string;
  }): Promise<SchemaVersion | undefined> => {
    const funcName = 'getLatestVersionForSchemaId';
    const logName = `${EpSdkSchemaVersionsService.name}.${funcName}()`;

    applicationDomainId;
    const schemaVersionList: Array<SchemaVersion> = await this.getVersionsForSchemaId({
      schemaId: schemaId,
    });

    const latestSchemaVersion: SchemaVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: schemaVersionList });
    return latestSchemaVersion;
  }

  public getLatestVersionForSchemaName = async ({ applicationDomainId, schemaName }: {
    applicationDomainId: string;
    schemaName: string;
  }): Promise<SchemaVersion | undefined> => {
    const funcName = 'getLatestVersionForSchemaName';
    const logName = `${EpSdkSchemaVersionsService.name}.${funcName}()`;

    const schemaVersionList: Array<SchemaVersion> = await this.getVersionsForSchemaName({
      schemaName: schemaName,
      applicationDomainId: applicationDomainId
    });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));

    const latestSchemaVersion: SchemaVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: schemaVersionList });
    return latestSchemaVersion;
  }

  public createSchemaVersion = async({ applicationDomainId, schemaId, schemaVersion, targetLifecycleStateId }:{
    applicationDomainId: string;
    schemaId: string;
    schemaVersion: SchemaVersion;
    targetLifecycleStateId: string;
  }): Promise<SchemaVersion> => {
    const funcName = 'createSchemaVersion';
    const logName = `${EpSdkSchemaVersionsService.name}.${funcName}()`;

    applicationDomainId;
    const schemaVersionResponse: SchemaVersionResponse = await SchemasService.createSchemaVersionForSchema({
      schemaId: schemaId,
      requestBody: schemaVersion
    });
    if(schemaVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'schemaVersionResponse.data === undefined', {
      schemaVersionResponse: schemaVersionResponse
    });
    const createdSchemaVersion: SchemaVersion = schemaVersionResponse.data;
    if(createdSchemaVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'schemaVersionResponse.data.id === undefined', {
      schemaVersionResponse: schemaVersionResponse
    });
    if(createdSchemaVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'schemaVersionResponse.data.stateId === undefined', {
      schemaVersionResponse: schemaVersionResponse
    });
    if(createdSchemaVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'schemaVersionResponse.data.version === undefined', {
      schemaVersionResponse: schemaVersionResponse
    });
    if(createdSchemaVersion.stateId !== targetLifecycleStateId) {
      const versionedObjectStateChangeRequest: VersionedObjectStateChangeRequest = await SchemasService.updateSchemaVersionStateForSchema({
        schemaId: schemaId,
        id: createdSchemaVersion.id,
        requestBody: {
          stateId: targetLifecycleStateId
        }
      });
      const updatedSchemaVersion: SchemaVersion | undefined = await this.getVersionByVersion({
        schemaId: schemaId,
        schemaVersionString: createdSchemaVersion.version
      });
      if(updatedSchemaVersion === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'updatedSchemaVersion === undefined', {
        updatedSchemaVersion: updatedSchemaVersion
      });
      return updatedSchemaVersion;
    }
    return createdSchemaVersion;
  }
}

export default new EpSdkSchemaVersionsService();

