import { EpSdkApiContentError } from "../EpSdkErrors";
import {
  EventsService, 
  EventVersion, 
  EventVersionsResponse,
  Event as EpEvent,
  EventVersionResponse,
  VersionedObjectStateChangeRequest
} from '@solace-labs/ep-openapi-node';
import EpSdkEpEventsService from "./EpSdkEpEventsService";
import { EpSdkVersionService } from "./EpSdkVersionService";

export class EpSdkEpEventVersionsService extends EpSdkVersionService {

  public getVersionByVersion = async ({ eventId, eventVersionString }: {
    eventId: string;
    eventVersionString: string;
  }): Promise<EventVersion | undefined> => {
    const funcName = 'getVersionByVersion';
    const logName = `${EpSdkEpEventVersionsService.name}.${funcName}()`;

    // EP API kaputt
    // const x = await EventsService.getEventVersionForEvent({
    //   eventId: eventId,
      
    // })

    const eventVersionList: Array<EventVersion> = await this.getVersionsForEventId({ eventId: eventId });
    const found: EventVersion | undefined = eventVersionList.find( (eventVersion: EventVersion ) => {
      if(eventVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventVersion.version === undefined', {
        eventVersion: eventVersion
      });
      return eventVersion.version === eventVersionString;
    });
    return found;
  }

  public getVersionsForEventId = async ({ eventId }: {
    eventId: string;
  }): Promise<Array<EventVersion>> => {
    const funcName = 'getVersionsForEventId';
    const logName = `${EpSdkEpEventVersionsService.name}.${funcName}()`;

    // trick (EP API kaputt)
    const params: any = {
      eventId: eventId
    }
    const eventVersionsResponse: EventVersionsResponse = await EventsService.getEventVersionsForEvent({
      ...params
    });
    if(eventVersionsResponse.data === undefined || eventVersionsResponse.data.length === 0) return [];
    return eventVersionsResponse.data;
  }

  public getVersionsForEventName = async ({ eventName, applicationDomainId }: {
    applicationDomainId: string;
    eventName: string;
  }): Promise<Array<EventVersion>> => {
    const funcName = 'getVersionsForEventName';
    const logName = `${EpSdkEpEventVersionsService.name}.${funcName}()`;

    const epEvent: EpEvent | undefined = await EpSdkEpEventsService.getByName({
      applicationDomainId: applicationDomainId,
      eventName: eventName,
    });

    if (epEvent === undefined) return [];
    if (epEvent.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epEvent.id === undefined', {
      epEvent: epEvent
    });
    const eventVersionList: Array<EpEvent> = await this.getVersionsForEventId({ eventId: epEvent.id });
    return eventVersionList;
  }

  public getLatestVersionString = async ({ eventId }: {
    eventId: string;
  }): Promise<string | undefined> => {
    const funcName = 'getLatestVersionString';
    const logName = `${EpSdkEpEventVersionsService.name}.${funcName}()`;

    const eventVersionList: Array<EventVersion> = await this.getVersionsForEventId({ eventId: eventId });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));
    const latestEventVersion: EventVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventVersionList });
    if(latestEventVersion === undefined) return undefined;
    if(latestEventVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'latestEventVersion.version === undefined', {
      latestEventVersion: latestEventVersion
    });
    return latestEventVersion.version;
  }

  public getLatestVersionForEventId = async ({ eventId, applicationDomainId }: {
    applicationDomainId: string;
    eventId: string;
  }): Promise<EventVersion | undefined> => {
    const funcName = 'getLatestVersionForEventId';
    const logName = `${EpSdkEpEventVersionsService.name}.${funcName}()`;

    applicationDomainId;
    const eventVersionList: Array<EventVersion> = await this.getVersionsForEventId({
      eventId: eventId,
    });

    const latestEventVersion: EventVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventVersionList });
    return latestEventVersion;
  }

  public getLatestVersionForEventName = async ({ applicationDomainId, eventName }: {
    applicationDomainId: string;
    eventName: string;
  }): Promise<EventVersion | undefined> => {
    const funcName = 'getLatestVersionForEventName';
    const logName = `${EpSdkEpEventVersionsService.name}.${funcName}()`;

    const eventVersionList: Array<EventVersion> = await this.getVersionsForEventName({
      eventName: eventName,
      applicationDomainId: applicationDomainId
    });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));

    const latestEventVersion: EventVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventVersionList });
    return latestEventVersion;
  }

  public createEventVersion = async({ applicationDomainId, eventId, eventVersion, targetLifecycleStateId }:{
    applicationDomainId: string;
    eventId: string;
    eventVersion: EventVersion;
    targetLifecycleStateId: string;
  }): Promise<EventVersion> => {
    const funcName = 'createEventVersion';
    const logName = `${EpSdkEpEventVersionsService.name}.${funcName}()`;

    applicationDomainId;
    const eventVersionResponse: EventVersionResponse = await EventsService.createEventVersionForEvent({
      eventId: eventId,
      requestBody: eventVersion
    });
    if(eventVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventVersionResponse.data === undefined', {
      eventVersionResponse: eventVersionResponse
    });
    const createdEventVersion: EventVersion = eventVersionResponse.data;
    if(createdEventVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventVersionResponse.data.id === undefined', {
      eventVersionResponse: eventVersionResponse
    });
    if(createdEventVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventVersionResponse.data.stateId === undefined', {
      eventVersionResponse: eventVersionResponse
    });
    if(createdEventVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventVersionResponse.data.version === undefined', {
      eventVersionResponse: eventVersionResponse
    });
    if(createdEventVersion.stateId !== targetLifecycleStateId) {
      const versionedObjectStateChangeRequest: VersionedObjectStateChangeRequest = await EventsService.updateEventVersionStateForEvent({
        eventId: eventId,
        id: createdEventVersion.id,
        requestBody: {
          stateId: targetLifecycleStateId
        }
      });
      const updatedEventVersion: EventVersion | undefined = await this.getVersionByVersion({
        eventId: eventId,
        eventVersionString: createdEventVersion.version
      });
      if(updatedEventVersion === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'updatedEventVersion === undefined', {
        updatedEventVersion: updatedEventVersion
      });
      return updatedEventVersion;
    }
    return createdEventVersion;
  }
}

export default new EpSdkEpEventVersionsService();

