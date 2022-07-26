import { EpSdkApiContentError } from "../utils/EpSdkErrors";
import {
  EnumsService,
  Pagination,
  StateChangeRequestResponse,
  TopicAddressEnum,
  TopicAddressEnumVersion,
  TopicAddressEnumVersionResponse,
  TopicAddressEnumVersionsResponse,
} from '@solace-labs/ep-openapi-node';
import EpSdkEnumsService from "./EpSdkEnumsService";
import { EpSdkVersionService } from "./EpSdkVersionService";
import { EpApiHelpers, T_EpMeta } from "../internal-utils/EpApiHelpers";
import { EpSdkEnumTask, IEpSdkEnumTask_ExecuteReturn } from "../tasks/EpSdkEnumTask";
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from "../tasks/EpSdkTask";
import { EpSdkEnumVersionTask, IEpSdkEnumVersionTask_ExecuteReturn } from "../tasks/EpSdkEnumVersionTask";
import { EEpSdk_VersionTaskStrategy } from "../tasks/EpSdkVersionTask";

export class EpSdkEnumVersionsService extends EpSdkVersionService {

  public getVersionByVersion = async ({ enumId, enumVersionString }: {
    enumId: string;
    enumVersionString: string;
  }): Promise<TopicAddressEnumVersion | undefined> => {
    const funcName = 'getVersionByVersion';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = await this.getVersionsForEnumId({
      enumId: enumId,
    });
    return topicAddressEnumVersionList.find( (topicAddressEnumVersion: TopicAddressEnumVersion) => {
      return topicAddressEnumVersion.version === enumVersionString;
    });
  }

  public getVersionsForEnumId = async ({ enumId, pageSize = EpApiHelpers.MaxPageSize }: {
    enumId: string;
    pageSize?: number; /** for testing */
  }): Promise<Array<TopicAddressEnumVersion>> => {
    const funcName = 'getVersionsForEnumId';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    const topicAddressEnumVersionList: Array<TopicAddressEnumVersion> = [];
    let nextPage: number | undefined | null = 1;

    while(nextPage !== undefined && nextPage !== null) {

      const topicAddressEnumVersionsResponse: TopicAddressEnumVersionsResponse = await EnumsService.getEnumVersions({
        enumIds: [enumId],
        pageNumber: nextPage,
        pageSize: pageSize
      });
      if (topicAddressEnumVersionsResponse.data === undefined || topicAddressEnumVersionsResponse.data.length === 0) nextPage = null;
      else {
        topicAddressEnumVersionList.push(...topicAddressEnumVersionsResponse.data);
      }
      /* istanbul ignore next */
      if(topicAddressEnumVersionsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'topicAddressEnumVersionsResponse.meta === undefined', {
        topicAddressEnumVersionsResponse: topicAddressEnumVersionsResponse
      });
      /* istanbul ignore next */
      if(topicAddressEnumVersionsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'topicAddressEnumVersionsResponse.meta.pagination === undefined', {
        topicAddressEnumVersionsResponse: topicAddressEnumVersionsResponse
      });
      const pagination: Pagination = topicAddressEnumVersionsResponse.meta.pagination;
      nextPage = pagination.nextPage;  
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
    /* istanbul ignore next */
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
    /* istanbul ignore next */
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

  public createEnumVersion = async({ enumId, topicAddressEnumVersion, targetLifecycleStateId }:{
    enumId: string;
    topicAddressEnumVersion: TopicAddressEnumVersion;
    targetLifecycleStateId: string;
  }): Promise<TopicAddressEnumVersion> => {
    const funcName = 'createEnumVersion';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    const topicAddressEnumVersionResponse: TopicAddressEnumVersionResponse = await EnumsService.createEnumVersion({
      requestBody: {        
        ...topicAddressEnumVersion,
        enumId: enumId,
      }
    });
    /* istanbul ignore next */
    if(topicAddressEnumVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'topicAddressEnumVersionResponse.data === undefined', {
      topicAddressEnumVersionResponse: topicAddressEnumVersionResponse
    });
    const createdTopicAddressEnumVersion: TopicAddressEnumVersion = topicAddressEnumVersionResponse.data;
    /* istanbul ignore next */
    if(createdTopicAddressEnumVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'createdTopicAddressEnumVersion.data.id === undefined', {
      createdTopicAddressEnumVersion: createdTopicAddressEnumVersion
    });
    /* istanbul ignore next */
    if(createdTopicAddressEnumVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'createdTopicAddressEnumVersion.data.stateId === undefined', {
      createdTopicAddressEnumVersion: createdTopicAddressEnumVersion
    });
    /* istanbul ignore next */
    if(createdTopicAddressEnumVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'createdTopicAddressEnumVersion.data.version === undefined', {
      createdTopicAddressEnumVersion: createdTopicAddressEnumVersion
    });
    if(createdTopicAddressEnumVersion.stateId !== targetLifecycleStateId) {
      const stateChangeRequestResponse: StateChangeRequestResponse = await EnumsService.updateEnumVersionState({
        id: createdTopicAddressEnumVersion.id,
        requestBody: {
          stateId: targetLifecycleStateId
        }
      });
      // const versionedObjectStateChangeRequest: VersionedObjectStateChangeRequest = await EnumsService.updateEnumVersionStateForEnum({
      //   enumId: enumId,
      //   id: createdTopicAddressEnumVersion.id,
      //   requestBody: {
      //     ...createdTopicAddressEnumVersion,
      //     stateId: targetLifecycleStateId
      //   }
      // });
      const updatedTopicAddressEnumVersion: TopicAddressEnumVersion | undefined = await this.getVersionByVersion({
        enumId: enumId,
        enumVersionString: createdTopicAddressEnumVersion.version
      });
      /* istanbul ignore next */
      if(updatedTopicAddressEnumVersion === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'updatedTopicAddressEnumVersion === undefined', {
        updatedTopicAddressEnumVersion: updatedTopicAddressEnumVersion
      });
      return updatedTopicAddressEnumVersion;
    }
    return createdTopicAddressEnumVersion;
  }

  public copyLastestVersionById_IfNotExists = async({ enumVersionId, fromApplicationDomainId, toApplicationDomainId }: {
    enumVersionId: string;
    fromApplicationDomainId: string;
    toApplicationDomainId: string;
  }): Promise<TopicAddressEnumVersion> => {
    const funcName = 'copyLastestVersionById_IfNotExists';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    // get the source enum version
    const fromTopicAddressEnumVersionResponse: TopicAddressEnumVersionResponse = await EnumsService.getEnumVersion({
      versionId: enumVersionId,
    });
    /* istanbul ignore next */
    if(fromTopicAddressEnumVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'fromTopicAddressEnumVersionResponse.data === undefined', {
      fromTopicAddressEnumVersionResponse: fromTopicAddressEnumVersionResponse
    });
    const fromTopicAddressEnumVersion: TopicAddressEnumVersion = fromTopicAddressEnumVersionResponse.data;
    /* istanbul ignore next */
    if(fromTopicAddressEnumVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'fromTopicAddressEnumVersion.stateId === undefined', {
      fromTopicAddressEnumVersion: fromTopicAddressEnumVersion
    });
    
    // get the source enum
    const fromTopicAddressEnum: TopicAddressEnum = await EpSdkEnumsService.getById({
      applicationDomainId: fromApplicationDomainId,
      enumId: fromTopicAddressEnumVersion.enumId
    });
    // ensure target enum exists
    const epSdkEnumTask = new EpSdkEnumTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      enumName: fromTopicAddressEnum.name,
      enumObjectSettings: {
        shared: fromTopicAddressEnum.shared ? fromTopicAddressEnum.shared : true,
      },
    });
    const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();
    if(epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action === EEpSdkTask_Action.NO_ACTION) {
      // return the latest version
      const targetTopicAddressEnumVersion: TopicAddressEnumVersion | undefined = await this.getLatestVersionForEnumId({
        enumId: epSdkEnumTask_ExecuteReturn.epObjectKeys.epObjectId,
        applicationDomainId: toApplicationDomainId
      });
      if(targetTopicAddressEnumVersion !== undefined) return targetTopicAddressEnumVersion;
    }
    // create target enum version
    const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      enumId: epSdkEnumTask_ExecuteReturn.epObjectKeys.epObjectId,
      versionString: fromTopicAddressEnumVersion.version,
      versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
      enumVersionSettings: {
        stateId: fromTopicAddressEnumVersion.stateId,
        displayName: fromTopicAddressEnumVersion.displayName ? fromTopicAddressEnumVersion.displayName : fromTopicAddressEnum.name,
        description: fromTopicAddressEnumVersion.description
      },
      enumValues: fromTopicAddressEnumVersion.values.map( (x) => { return x.value; }),
    });
    const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();
    return epSdkEnumVersionTask_ExecuteReturn.epObject;
  }

}

export default new EpSdkEnumVersionsService();

