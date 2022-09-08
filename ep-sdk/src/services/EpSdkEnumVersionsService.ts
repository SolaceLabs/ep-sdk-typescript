import { EpSdkApiContentError } from "../utils/EpSdkErrors";
import {
  EnumsService,
  TopicAddressEnum,
  TopicAddressEnumVersion,
  TopicAddressEnumVersionResponse,
  TopicAddressEnumVersionsResponse,
  VersionedObjectStateChangeRequest
} from '@solace-labs/ep-openapi-node';
import EpSdkEnumsService from "./EpSdkEnumsService";
import { EpSdkVersionService } from "./EpSdkVersionService";
import { EpApiHelpers, T_EpMeta } from "../internal-utils/EpApiHelpers";

export class EpSdkEnumVersionsService extends EpSdkVersionService {

  public getVersionByVersion = async ({ enumId, enumVersionString }: {
    enumId: string;
    enumVersionString: string;
  }): Promise<TopicAddressEnumVersion | undefined> => {
    const funcName = 'getVersionByVersion';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    const topicAddressEnumVersionsResponse: TopicAddressEnumVersionsResponse = await EnumsService.getEnumVersionsForEnum({
      enumId: enumId,
      versions: [enumVersionString]
    });
    if (topicAddressEnumVersionsResponse.data === undefined || topicAddressEnumVersionsResponse.data.length === 0) return undefined;
    if (topicAddressEnumVersionsResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name, 'topicAddressEnumVersionsResponse.data.length > 1', {
      topicAddressEnumVersionsResponse: topicAddressEnumVersionsResponse
    });
    return topicAddressEnumVersionsResponse.data[0];
  }

  public getVersionsForEnumId = async ({ enumId, pageSize = EpApiHelpers.MaxPageSize }: {
    enumId: string;
    pageSize?: number; /** for testing */
  }): Promise<Array<TopicAddressEnumVersion>> => {
    const funcName = 'getVersionsForEnumId';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = [];
    let nextPage: number | null = 1;

    while(nextPage !== null) {

      const topicAddressEnumVersionsResponse: TopicAddressEnumVersionsResponse = await EnumsService.getEnumVersionsForEnum({
        enumId: enumId,
        pageSize: pageSize,
        pageNumber: nextPage
      });
      
      if (topicAddressEnumVersionsResponse.data === undefined || topicAddressEnumVersionsResponse.data.length === 0) return [];

      topicAddressEnumVersionList.push(...topicAddressEnumVersionsResponse.data);

      const meta: T_EpMeta = topicAddressEnumVersionsResponse.meta as T_EpMeta;
      EpApiHelpers.validateMeta(meta);
      nextPage = meta.pagination.nextPage;

    }
    // // DEBUG
    // throw new EpSdkApiContentError(logName, this.constructor.name, 'testing', {
    //   enumVersionList: enumVersionList
    // });
    return topicAddressEnumVersionList;
  }

  public getVersionsForEnumName = async ({ enumName, applicationDomainId }: {
    applicationDomainId: string;
    enumName: string;
  }): Promise<Array<TopicAddressEnumVersion>> => {
    const funcName = 'getVersionsForEnumName';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    const topicAddressEnum: TopicAddressEnum | undefined = await EpSdkEnumsService.getByName({
      applicationDomainId: applicationDomainId,
      enumName: enumName
    });
    if (topicAddressEnum === undefined) return [];
    if (topicAddressEnum.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'topicAddressEnum.id === undefined', {
      topicAddressEnum: topicAddressEnum
    });
    const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = await this.getVersionsForEnumId({ enumId: topicAddressEnum.id });
    return topicAddressEnumVersionList;
  }

  public getLatestVersionString = async ({ enumId }: {
    enumId: string;
  }): Promise<string | undefined> => {
    const funcName = 'getLatestVersionString';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = await this.getVersionsForEnumId({ enumId: enumId });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));
    const latestTopicAddressEnumVersion: TopicAddressEnumVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: topicAddressEnumVersionList });
    if (latestTopicAddressEnumVersion === undefined) return undefined;
    if (latestTopicAddressEnumVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'latestTopicAddressEnumVersion.version === undefined', {
      latestTopicAddressEnumVersion: latestTopicAddressEnumVersion
    });
    return latestTopicAddressEnumVersion.version;
  }

  public getLatestVersionForEnumId = async ({ enumId, applicationDomainId }: {
    applicationDomainId: string;
    enumId: string;
  }): Promise<TopicAddressEnumVersion | undefined> => {
    const funcName = 'getLatestVersionForEnumId';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    applicationDomainId;
    const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = await this.getVersionsForEnumId({
      enumId: enumId,
    });

    const latestTopicAddressEnumVersion: TopicAddressEnumVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: topicAddressEnumVersionList });
    return latestTopicAddressEnumVersion;
  }

  public getLatestVersionForEnumName = async ({ applicationDomainId, enumName }: {
    applicationDomainId: string;
    enumName: string;
  }): Promise<TopicAddressEnumVersion | undefined> => {
    const funcName = 'getLatestVersionForEnumName';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = await this.getVersionsForEnumName({
      enumName: enumName,
      applicationDomainId: applicationDomainId
    });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));

    const latestTopicAddressEnumVersion: TopicAddressEnumVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: topicAddressEnumVersionList });
    return latestTopicAddressEnumVersion;
  }

  public createEnumVersion = async({ applicationDomainId, enumId, topicAddressEnumVersion, targetLifecycleStateId }:{
    applicationDomainId: string;
    enumId: string;
    topicAddressEnumVersion: TopicAddressEnumVersion;
    targetLifecycleStateId: string;
  }): Promise<TopicAddressEnumVersion> => {
    const funcName = 'createEnumVersion';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    applicationDomainId;
    const topicAddressEnumVersionResponse: TopicAddressEnumVersionResponse = await EnumsService.createEnumVersionForEnum({
      enumId: enumId,
      requestBody: topicAddressEnumVersion
    });
    if(topicAddressEnumVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'topicAddressEnumVersionResponse.data === undefined', {
      topicAddressEnumVersionResponse: topicAddressEnumVersionResponse
    });
    const createdTopicAddressEnumVersion: TopicAddressEnumVersion = topicAddressEnumVersionResponse.data;
    if(createdTopicAddressEnumVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'createdTopicAddressEnumVersion.data.id === undefined', {
      createdTopicAddressEnumVersion: createdTopicAddressEnumVersion
    });
    if(createdTopicAddressEnumVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'createdTopicAddressEnumVersion.data.stateId === undefined', {
      createdTopicAddressEnumVersion: createdTopicAddressEnumVersion
    });
    if(createdTopicAddressEnumVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'createdTopicAddressEnumVersion.data.version === undefined', {
      createdTopicAddressEnumVersion: createdTopicAddressEnumVersion
    });
    if(createdTopicAddressEnumVersion.stateId !== targetLifecycleStateId) {
      const versionedObjectStateChangeRequest: VersionedObjectStateChangeRequest = await EnumsService.updateEnumVersionStateForEnum({
        enumId: enumId,
        id: createdTopicAddressEnumVersion.id,
        requestBody: {
          ...createdTopicAddressEnumVersion,
          stateId: targetLifecycleStateId
        }
      });
      const updatedTopicAddressEnumVersion: TopicAddressEnumVersion | undefined = await this.getVersionByVersion({
        enumId: enumId,
        enumVersionString: createdTopicAddressEnumVersion.version
      });
      if(updatedTopicAddressEnumVersion === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'updatedTopicAddressEnumVersion === undefined', {
        updatedTopicAddressEnumVersion: updatedTopicAddressEnumVersion
      });
      return updatedTopicAddressEnumVersion;
    }
    return createdTopicAddressEnumVersion;
  }
}

export default new EpSdkEnumVersionsService();

