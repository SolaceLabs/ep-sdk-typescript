import { EpSdkApiContentError } from "../utils/EpSdkErrors";
import {
  Application,
  ApplicationsService,
  ApplicationVersion,
  ApplicationVersionResponse,
  ApplicationVersionsResponse,
  VersionedObjectStateChangeRequest
} from '@solace-labs/ep-openapi-node';
import EpSdkApplicationsService from "./EpSdkApplicationsService";
import { EpSdkVersionService } from "./EpSdkVersionService";
import { EpApiHelpers, T_EpMeta } from "../internal-utils/EpApiHelpers";

export class EpSdkApplicationVersionsService extends EpSdkVersionService {

  public getVersionByVersion = async ({ applicationId, applicationVersionString }: {
    applicationId: string;
    applicationVersionString: string;
  }): Promise<ApplicationVersion | undefined> => {
    const funcName = 'getVersionByVersion';
    const logName = `${EpSdkApplicationVersionsService.name}.${funcName}()`;

    const applicationVersionsResponse: ApplicationVersionsResponse = await ApplicationsService.getApplicationVersionsForApplication({
      applicationId: applicationId,
      version: applicationVersionString,
    });
    if (applicationVersionsResponse.data === undefined || applicationVersionsResponse.data.length === 0) return undefined;
    if (applicationVersionsResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationVersionsResponse.data.length > 1', {
      applicationVersionsResponse: applicationVersionsResponse
    });
    return applicationVersionsResponse.data[0];
  }

  public getVersionsForApplicationId = async ({ applicationId }: {
    applicationId: string;
  }): Promise<Array<ApplicationVersion>> => {
    const funcName = 'getVersionsForApplicationId';
    const logName = `${EpSdkApplicationVersionsService.name}.${funcName}()`;

    const applicationVersionList: Array<ApplicationVersion> = [];
    let nextPage: number | null = 1;

    while(nextPage !== null) {

      const applicationVersionsResponse: ApplicationVersionsResponse = await ApplicationsService.getApplicationVersionsForApplication({
        applicationId: applicationId,
      });
      
      if (applicationVersionsResponse.data === undefined || applicationVersionsResponse.data.length === 0) return [];

      applicationVersionList.push(...applicationVersionsResponse.data);

      const meta: T_EpMeta = applicationVersionsResponse.meta as T_EpMeta;
      EpApiHelpers.validateMeta(meta);
      nextPage = meta.pagination.nextPage;

    }
    // // DEBUG
    // throw new EpSdkApiContentError(logName, this.constructor.name, 'testing', {
    //   applicationVersionList: applicationVersionList
    // });
    return applicationVersionList;
  }

  public getVersionsForApplicationName = async ({ applicationName, applicationDomainId }: {
    applicationDomainId: string;
    applicationName: string;
  }): Promise<Array<ApplicationVersion>> => {
    const funcName = 'getVersionsForApplicationName';
    const logName = `${EpSdkApplicationVersionsService.name}.${funcName}()`;

    const applicationObject: Application | undefined = await EpSdkApplicationsService.getByName({
      applicationDomainId: applicationDomainId,
      applicationName: applicationName
    });
    if (applicationObject === undefined) return [];
    if (applicationObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationObject.id === undefined', {
      applicationObject: applicationObject
    });
    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationId({ applicationId: applicationObject.id });
    return applicationVersionList;
  }

  public getLatestVersionString = async ({ applicationId }: {
    applicationId: string;
  }): Promise<string | undefined> => {
    const funcName = 'getLatestVersionString';
    const logName = `${EpSdkApplicationVersionsService.name}.${funcName}()`;

    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationId({ applicationId: applicationId });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   applicationVersionList: applicationVersionList
    // }}));
    const latestApplicationVersion: ApplicationVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: applicationVersionList });
    if (latestApplicationVersion === undefined) return undefined;
    if (latestApplicationVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'latestApplicationVersion.version === undefined', {
      latestApplicationVersion: latestApplicationVersion
    });
    return latestApplicationVersion.version;
  }

  public getLatestVersionForApplicationId = async ({ applicationId, applicationDomainId }: {
    applicationDomainId: string;
    applicationId: string;
  }): Promise<ApplicationVersion | undefined> => {
    const funcName = 'getLatestVersionForApplicationId';
    const logName = `${EpSdkApplicationVersionsService.name}.${funcName}()`;

    applicationDomainId;
    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationId({
      applicationId: applicationId,
    });

    const latestApplicationVersion: ApplicationVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: applicationVersionList });
    return latestApplicationVersion;
  }

  public getLatestVersionForApplicationName = async ({ applicationDomainId, applicationName }: {
    applicationDomainId: string;
    applicationName: string;
  }): Promise<ApplicationVersion | undefined> => {
    const funcName = 'getLatestVersionForApplicationName';
    const logName = `${EpSdkApplicationVersionsService.name}.${funcName}()`;

    const applicationVersionList: Array<ApplicationVersion> = await this.getVersionsForApplicationName({
      applicationName: applicationName,
      applicationDomainId: applicationDomainId
    });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   applicationVersionList: applicationVersionList
    // }}));

    const latestApplicationVersion: ApplicationVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: applicationVersionList });
    return latestApplicationVersion;
  }

  public createApplicationVersion = async({ applicationDomainId, applicationId, applicationVersion, targetLifecycleStateId }:{
    applicationDomainId: string;
    applicationId: string;
    applicationVersion: ApplicationVersion;
    targetLifecycleStateId: string;
  }): Promise<ApplicationVersion> => {
    const funcName = 'createApplicationVersion';
    const logName = `${EpSdkApplicationVersionsService.name}.${funcName}()`;

    applicationDomainId;
    const applicationVersionResponse: ApplicationVersionResponse = await ApplicationsService.createApplicationVersionForApplication({
      applicationId: applicationId,
      requestBody: applicationVersion,
    });
    if(applicationVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationVersionResponse.data === undefined', {
      applicationVersionResponse: applicationVersionResponse
    });
    const createdApplicationVersion: ApplicationVersion = applicationVersionResponse.data;
    if(createdApplicationVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationVersionResponse.data.id === undefined', {
      applicationVersionResponse: applicationVersionResponse
    });
    if(createdApplicationVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationVersionResponse.data.stateId === undefined', {
      applicationVersionResponse: applicationVersionResponse
    });
    if(createdApplicationVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationVersionResponse.data.version === undefined', {
      applicationVersionResponse: applicationVersionResponse
    });
    if(createdApplicationVersion.stateId !== targetLifecycleStateId) {
      const versionedObjectStateChangeRequest: VersionedObjectStateChangeRequest = await ApplicationsService.updateApplicationVersionStateForApplication({
        applicationId: applicationId,
        id: createdApplicationVersion.id,
        requestBody: {
          ...applicationVersion,
          stateId: targetLifecycleStateId
        }
      });
      const updatedApplicationVersion: ApplicationVersion | undefined = await this.getVersionByVersion({
        applicationId: applicationId,
        applicationVersionString: createdApplicationVersion.version
      });
      if(updatedApplicationVersion === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'updatedApplicationVersion === undefined', {
        updatedApplicationVersion: updatedApplicationVersion
      });
      return updatedApplicationVersion;
    }
    return createdApplicationVersion;
  }
}

export default new EpSdkApplicationVersionsService();

