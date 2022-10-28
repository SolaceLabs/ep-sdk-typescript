import { Validator, ValidatorResult } from 'jsonschema';
import { EpSdkVersionService } from "./EpSdkVersionService";
import { EpSdkApiContentError, EpSdkValidationError } from "../utils/EpSdkErrors";
import {
  $EventApiVersion, 
  VersionedObjectStateChangeRequest,
  EventApIsService,
  EventApiVersionsResponse,
  EventApi,
  EventApiVersionResponse,
  EventApiVersion,
  EventVersion,
} from '@solace-labs/ep-openapi-node';
import EpSdkEventApisService from './EpSdkEventApisService';
import { EpApiHelpers, T_EpMeta } from "../internal-utils/EpApiHelpers";
import EpSdkEpEventVersionsService from './EpSdkEpEventVersionsService';
import { EpSdkEventApiTask, IEpSdkEventApiTask_ExecuteReturn } from '../tasks/EpSdkEventApiTask';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../tasks/EpSdkTask';
import { EpSdkEventApiVersionTask, IEpSdkEventApiVersionTask_ExecuteReturn } from '../tasks/EpSdkEventApiVersionTask';
import { EEpSdk_VersionTaskStrategy } from '../tasks/EpSdkVersionTask';

export class EpSdkEventApiVersionsService extends EpSdkVersionService {

  public validateDisplayName = ({ displayName }: {
    displayName: string;
  }): string => {
    const funcName = 'validateDisplayName';
    const logName = `${EpSdkEventApiVersionsService.name}.${funcName}()`;
    const schema = $EventApiVersion.properties.displayName;

    const v: Validator = new Validator();
    const validateResult: ValidatorResult = v.validate(displayName, schema);
    if(!validateResult.valid) throw new EpSdkValidationError(logName, this.constructor.name, undefined, validateResult.errors, {
      displayName: displayName
    });
    return displayName;
  }

  public getVersionByVersion = async ({ eventApiId, eventApiVersionString }: {
    eventApiId: string;
    eventApiVersionString: string;
  }): Promise<EventApiVersion | undefined> => {
    const funcName = 'getVersionByVersion';
    const logName = `${EpSdkEventApiVersionsService.name}.${funcName}()`;

    const eventApiVersionList: Array<EventApiVersion> = await this.getVersionsForEventApiId({ eventApiId: eventApiId });
    const found: EventApiVersion | undefined = eventApiVersionList.find( (eventApiVersion: EventApiVersion ) => {
      /* istanbul ignore next */
      if(eventApiVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersion.version === undefined', {
        eventApiVersion: eventApiVersion
      });
      return eventApiVersion.version === eventApiVersionString;
    });
    return found;
  }

  public getVersionsForEventApiId = async ({ eventApiId, pageSize = EpApiHelpers.MaxPageSize }: {
    eventApiId: string;
    pageSize?: number; /** for testing */
  }): Promise<Array<EventApiVersion>> => {
    const funcName = 'getVersionsForEventApiId';
    const logName = `${EpSdkEventApiVersionsService.name}.${funcName}()`;

    const versionList: Array<EventApiVersion> = [];
    let nextPage: number | null = 1;

    while(nextPage !== null) {

      // WORKAROUND_BACKWARDS_COMPATIBILITY_PAGING
      const params: any = {
        pageSize: pageSize,
        pageNumber: nextPage
      };
      const versionsResponse: EventApiVersionsResponse = await EventApIsService.getEventApiVersionsForEventApi({
        eventApiId: eventApiId,
        ...params
      });
  
      if (versionsResponse.data === undefined || versionsResponse.data.length === 0) return [];

      versionList.push(...versionsResponse.data);

      const meta: T_EpMeta = versionsResponse.meta as T_EpMeta;
      EpApiHelpers.validateMeta(meta);
      nextPage = meta.pagination.nextPage;

    }
    return versionList;
  }

  public getVersionsForEventApiName = async ({ eventApiName, applicationDomainId }: {
    applicationDomainId: string;
    eventApiName: string;
  }): Promise<Array<EventApiVersion>> => {
    const funcName = 'getVersionsForEventName';
    const logName = `${EpSdkEventApiVersionsService.name}.${funcName}()`;

    const eventApi: EventApi | undefined = await EpSdkEventApisService.getByName({
      applicationDomainId: applicationDomainId,
      eventApiName: eventApiName,
    });

    if (eventApi === undefined) return [];
    /* istanbul ignore next */
    if (eventApi.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApi.id === undefined', {
      eventApi: eventApi
    });
    const eventApiVersionList: Array<EventApi> = await this.getVersionsForEventApiId({ eventApiId: eventApi.id });
    return eventApiVersionList;
  }

  public getLatestVersionString = async ({ eventApiId }: {
    eventApiId: string;
  }): Promise<string | undefined> => {
    const funcName = 'getLatestVersionString';
    const logName = `${EpSdkEventApiVersionsService.name}.${funcName}()`;

    const eventApiVersionList: Array<EventApiVersion> = await this.getVersionsForEventApiId({ eventApiId: eventApiId });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));
    const latestEventVersion: EventApiVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventApiVersionList });
    if(latestEventVersion === undefined) return undefined;
    /* istanbul ignore next */
    if(latestEventVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'latestEventVersion.version === undefined', {
      latestEventVersion: latestEventVersion
    });
    return latestEventVersion.version;
  }

  public getLatestVersionForEventApiId = async ({ eventApiId, applicationDomainId }: {
    applicationDomainId: string;
    eventApiId: string;
  }): Promise<EventApiVersion | undefined> => {
    const funcName = 'getLatestVersionForEventApiId';
    const logName = `${EpSdkEventApiVersionsService.name}.${funcName}()`;

    applicationDomainId;
    const eventApiVersionList: Array<EventApiVersion> = await this.getVersionsForEventApiId({
      eventApiId: eventApiId,
    });

    const latestEventVersion: EventApiVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventApiVersionList });
    return latestEventVersion;
  }

  public getLatestVersionForEventApiName = async ({ applicationDomainId, eventApiName }: {
    applicationDomainId: string;
    eventApiName: string;
  }): Promise<EventApiVersion | undefined> => {
    const funcName = 'getLatestVersionForEventApiName';
    const logName = `${EpSdkEventApiVersionsService.name}.${funcName}()`;

    const eventApiVersionList: Array<EventApiVersion> = await this.getVersionsForEventApiName({
      eventApiName: eventApiName,
      applicationDomainId: applicationDomainId
    });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));

    const latestEventApiVersion: EventApiVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventApiVersionList });
    return latestEventApiVersion;
  }

  public createEventApiVersion = async({ applicationDomainId, eventApiId, eventApiVersion, targetLifecycleStateId }:{
    applicationDomainId: string;
    eventApiId: string;
    eventApiVersion: EventApiVersion;
    targetLifecycleStateId: string;
  }): Promise<EventApiVersion> => {
    const funcName = 'createEventApiVersion';
    const logName = `${EpSdkEventApiVersionsService.name}.${funcName}()`;

    applicationDomainId;

    if(eventApiVersion.displayName) this.validateDisplayName({ displayName: eventApiVersion.displayName });

    const eventApiVersionResponse: EventApiVersionResponse = await EventApIsService.createEventApiVersionForEventApi({
      eventApiId: eventApiId,
      requestBody: eventApiVersion
    });
    /* istanbul ignore next */
    if(eventApiVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersionResponse.data === undefined', {
      eventApiVersionResponse: eventApiVersionResponse
    });
    const createdEvenApiVersion: EventApiVersion = eventApiVersionResponse.data;
    /* istanbul ignore next */
    if(createdEvenApiVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersionResponse.data.id === undefined', {
      eventApiVersionResponse: eventApiVersionResponse
    });
    /* istanbul ignore next */
    if(createdEvenApiVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersionResponse.data.stateId === undefined', {
      eventApiVersionResponse: eventApiVersionResponse
    });
    /* istanbul ignore next */
    if(createdEvenApiVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersionResponse.data.version === undefined', {
      eventApiVersionResponse: eventApiVersionResponse
    });
    if(createdEvenApiVersion.stateId !== targetLifecycleStateId) {
      const versionedObjectStateChangeRequest: VersionedObjectStateChangeRequest = await EventApIsService.updateEventApiVersionStateForEventApi({
        eventApiId: eventApiId,
        id: createdEvenApiVersion.id,
        requestBody: {
          stateId: targetLifecycleStateId
        }
      });
      const updatedEventApiVersion: EventApiVersion | undefined = await this.getVersionByVersion({
        eventApiId: eventApiId,
        eventApiVersionString: createdEvenApiVersion.version
      });
      /* istanbul ignore next */
      if(updatedEventApiVersion === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'updatedEventApiVersion === undefined', {
        updatedEventApiVersion: updatedEventApiVersion
      });
      return updatedEventApiVersion;
    }
    return createdEvenApiVersion;
  }

  /**
   * Conditional deep copy of event api & event api latest version from 'fromApplicationDomain' to 'toApplicationDomain'. 
   * - copies all referenced events, schemas, enums first from 'fromAssetApplicationDomainId' to 'toAssetApplicationDomainId'
   * - sets 'fromAssetApplicationDomainId' and 'toAssetApplicationDomainId' to 'fromApplicationDomainId' and 'toApplicationDomainId' respectively if not defined.
   * 
   * If an event api version for the event api with 'eventApiName' already exists, returns undefined. 
   * 
   * @returns undefined or created event api version
   */
  public deepCopyLastestVersionById_IfNotExists = async({ eventApiName, fromApplicationDomainId, toApplicationDomainId, fromAssetsApplicationDomainId, toAssetsApplicationDomainId }:{
    eventApiName: string; 
    fromApplicationDomainId: string;
    toApplicationDomainId: string;
    fromAssetsApplicationDomainId?: string;
    toAssetsApplicationDomainId?: string;
  }): Promise<EventApiVersion | undefined> => {
    const funcName = 'deepCopyLastestVersionById_IfNotExists';
    const logName = `${EpSdkEventApiVersionsService.name}.${funcName}()`;

    if(fromAssetsApplicationDomainId === undefined || toAssetsApplicationDomainId === undefined) {
      fromAssetsApplicationDomainId = fromApplicationDomainId;
      toAssetsApplicationDomainId = toApplicationDomainId;
    }
    // get the source event api by name
    const fromEventApi: EventApi | undefined = await EpSdkEventApisService.getByName({ 
      eventApiName: eventApiName,
      applicationDomainId: fromApplicationDomainId
    });
    if(fromEventApi === undefined) return undefined;
    /* istanbul ignore next */
    if(fromEventApi.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'fromEventApi.id === undefined', {
      fromEventApi: fromEventApi
    });
    /* istanbul ignore next */
    if(fromEventApi.name === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'fromEventApi.name === undefined', {
      fromEventApi: fromEventApi
    });
    // get the latest source event api version
    const fromEventApiVersion = await this.getLatestVersionForEventApiId({
      eventApiId: fromEventApi.id,
      applicationDomainId: fromApplicationDomainId,
    });
    if(fromEventApiVersion === undefined) return undefined;
    /* istanbul ignore next */
    if(fromEventApiVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromEventApiVersion.stateId === undefined", {
      fromEventApiVersion: fromEventApiVersion
    });

    // check if a version already exists, if it does, return undefined
    const targetEventApiCheck: EventApi | undefined = await EpSdkEventApisService.getByName({
      applicationDomainId: toApplicationDomainId,
      eventApiName: eventApiName
    });
    if(targetEventApiCheck !== undefined) {
      /* istanbul ignore next */
      if(targetEventApiCheck.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "targetEventApiCheck.id === undefined", {
        targetEventApiCheck: targetEventApiCheck
      });
      const existingTargetVersion: EventApiVersion | undefined = await this.getLatestVersionForEventApiId({
        applicationDomainId: toApplicationDomainId,
        eventApiId: targetEventApiCheck.id
      });
      if(existingTargetVersion !== undefined) return undefined;
    }

    // get list of consumed & produced event versions
    const targetConsumedEventVersions: Array<EventVersion> = [];
    const targetProducedEventVersions: Array<EventVersion> = [];
    if(fromEventApiVersion.consumedEventVersionIds) {
      for(const eventVersionId of fromEventApiVersion.consumedEventVersionIds) {
        const eventVersion: EventVersion | undefined = await EpSdkEpEventVersionsService.deepCopyLastestVersionById_IfNotExists({ 
          eventVersionId: eventVersionId,
          fromApplicationDomainId: fromAssetsApplicationDomainId,
          toApplicationDomainId: toAssetsApplicationDomainId,
        });
        targetConsumedEventVersions.push(eventVersion);
      }
    }
    if(fromEventApiVersion.producedEventVersionIds) {
      for(const eventVersionId of fromEventApiVersion.producedEventVersionIds) {
        const eventVersion: EventVersion | undefined = await EpSdkEpEventVersionsService.deepCopyLastestVersionById_IfNotExists({ 
          eventVersionId: eventVersionId,
          fromApplicationDomainId: fromAssetsApplicationDomainId,
          toApplicationDomainId: toAssetsApplicationDomainId,
        });
        targetProducedEventVersions.push(eventVersion);
      }
    }
    // create the target event api & version
    // ensure target version object exists
    const epSdkEventApiTask = new EpSdkEventApiTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      eventApiName: fromEventApi.name,
      eventApiObjectSettings: {
        shared: fromEventApi.shared ? fromEventApi.shared : true,
      },
    });
    const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute();
    // note: not necessary, check has been done above
    // if(epSdkEventApiTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action === EEpSdkTask_Action.NO_ACTION) {
    //   // return the latest version
    //   const targetEventApiVersion: EventApiVersion | undefined = await this.getLatestVersionForEventApiId({
    //     applicationDomainId: toApplicationDomainId,
    //     eventApiId: epSdkEventApiTask_ExecuteReturn.epObjectKeys.epObjectId,
    //   });
    //   if(targetEventApiVersion !== undefined) return targetEventApiVersion;
    // }
    // create target event api version
    const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      eventApiId: epSdkEventApiTask_ExecuteReturn.epObjectKeys.epObjectId,
      versionString: fromEventApiVersion.version,
      versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
      eventApiVersionSettings: {
        stateId: fromEventApiVersion.stateId,
        displayName: fromEventApiVersion.displayName ? fromEventApiVersion.displayName : fromEventApi.name,
        description: fromEventApiVersion.description ? fromEventApiVersion.description : '',
        consumedEventVersionIds: targetConsumedEventVersions.map( (targetConsumedEventVersion: EventVersion) => {
          /* istanbul ignore next */
          if(targetConsumedEventVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "targetConsumedEventVersion.id === undefined", {
            targetConsumedEventVersion: targetConsumedEventVersion
          });
          return targetConsumedEventVersion.id; 
        }),
        producedEventVersionIds: targetProducedEventVersions.map( (targetProducedEventVersion: EventVersion) => { 
          /* istanbul ignore next */
          if(targetProducedEventVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "targetProducedEventVersion.id === undefined", {
            targetProducedEventVersion: targetProducedEventVersion
          });
          return targetProducedEventVersion.id; 
        }),
      },
    });
    const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();
    // must get the object again, otherwise not all properties are set correctly
    /* istanbul ignore next */
    if(epSdkEventApiVersionTask_ExecuteReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEventApiVersionTask_ExecuteReturn.epObject.id === undefined', {
      epSdkEventApiVersionTask_ExecuteReturn: epSdkEventApiVersionTask_ExecuteReturn
    });
    const eventApiVersionResponse: EventApiVersionResponse =  await EventApIsService.getEventApiVersion({
      versionId: epSdkEventApiVersionTask_ExecuteReturn.epObject.id,
      include: ''
    });
    /* istanbul ignore next */
    if(eventApiVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersionResponse.data === undefined', {
      eventApiVersionResponse: eventApiVersionResponse
    });
    return eventApiVersionResponse.data;
  }

}

export default new EpSdkEventApiVersionsService();

