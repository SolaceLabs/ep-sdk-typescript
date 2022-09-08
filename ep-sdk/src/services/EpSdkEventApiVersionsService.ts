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
} from '@solace-labs/ep-openapi-node';
import EpSdkEventApisService from './EpSdkEventApisService';
import { EpApiHelpers, T_EpMeta } from "../internal-utils/EpApiHelpers";

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

      // WORKAROUND_UNTIL_EP_API_FIXED
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
    if(eventApiVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersionResponse.data === undefined', {
      eventApiVersionResponse: eventApiVersionResponse
    });
    const createdEvenApiVersion: EventApiVersion = eventApiVersionResponse.data;
    if(createdEvenApiVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersionResponse.data.id === undefined', {
      eventApiVersionResponse: eventApiVersionResponse
    });
    if(createdEvenApiVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersionResponse.data.stateId === undefined', {
      eventApiVersionResponse: eventApiVersionResponse
    });
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
      if(updatedEventApiVersion === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'updatedEventApiVersion === undefined', {
        updatedEventApiVersion: updatedEventApiVersion
      });
      return updatedEventApiVersion;
    }
    return createdEvenApiVersion;
  }
}

export default new EpSdkEventApiVersionsService();

