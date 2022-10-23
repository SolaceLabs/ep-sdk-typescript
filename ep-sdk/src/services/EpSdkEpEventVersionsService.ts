import { EpSdkApiContentError, EpSdkFeatureNotSupportedError, EpSdkServiceError } from "../utils/EpSdkErrors";
import {
  EventsService, 
  EventVersion, 
  EventVersionsResponse,
  Event as EpEvent,
  EventVersionResponse,
  VersionedObjectStateChangeRequest,
  SchemaVersion,
  DeliveryDescriptor,
  Address,
  AddressLevel,
  TopicAddressEnumVersion
} from '@solace-labs/ep-openapi-node';
import EpSdkEpEventsService from "./EpSdkEpEventsService";
import { EpSdkVersionService } from "./EpSdkVersionService";
import { EpApiHelpers, T_EpMeta } from "../internal-utils/EpApiHelpers";
import EpSdkSchemaVersionsService from "./EpSdkSchemaVersionsService";
import EpSdkEnumVersionsService from "./EpSdkEnumVersionsService";
import { EpSdkEpEventTask, IEpSdkEpEventTask_ExecuteReturn } from "../tasks/EpSdkEpEventTask";
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from "../tasks/EpSdkTask";
import { EpSdkEpEventVersionTask, IEpSdkEpEventVersionTask_ExecuteReturn } from "../tasks/EpSdkEpEventVersionTask";
import { EEpSdk_VersionTaskStrategy } from "../tasks/EpSdkVersionTask";
import { EpSdkUtils } from "../utils/EpSdkUtils";

export class EpSdkEpEventVersionsService extends EpSdkVersionService {

  public getVersionByVersion = async ({ eventId, eventVersionString }: {
    eventId: string;
    eventVersionString: string;
  }): Promise<EventVersion | undefined> => {
    const funcName = 'getVersionByVersion';
    const logName = `${EpSdkEpEventVersionsService.name}.${funcName}()`;

    const eventVersionList: Array<EventVersion> = await this.getVersionsForEventId({ eventId: eventId });
    const found: EventVersion | undefined = eventVersionList.find( (eventVersion: EventVersion ) => {
      if(eventVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventVersion.version === undefined', {
        eventVersion: eventVersion
      });
      return eventVersion.version === eventVersionString;
    });
    return found;
  }

  public getVersionsForEventId = async ({ eventId, pageSize = EpApiHelpers.MaxPageSize }: {
    eventId: string;
    pageSize?: number; /** for testing */
  }): Promise<Array<EventVersion>> => {
    const funcName = 'getVersionsForEventId';
    const logName = `${EpSdkEpEventVersionsService.name}.${funcName}()`;

    pageSize;
    const versionList: Array<EventVersion> = [];
    let nextPage: number | null = 1;

    while(nextPage !== null) {
      const versionsResponse: EventVersionsResponse = await EventsService.getEventVersionsForEvent({
        eventId: eventId,
        // pageSize: pageSize,
        // pageNumber: nextPage
      });
      
      if (versionsResponse.data === undefined || versionsResponse.data.length === 0) return [];

      versionList.push(...versionsResponse.data);

      const meta: T_EpMeta = versionsResponse.meta as T_EpMeta;
      EpApiHelpers.validateMeta(meta);
      nextPage = meta.pagination.nextPage;

    }
    return versionList;
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
    const eventVersionList: Array<EventVersion> = await this.getVersionsForEventId({ eventId: epEvent.id });
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
          ...createdEventVersion,
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

  public createTopicStringFromAddress = ({ address }: {
    address: Address;
  }): string => {
    const funcName = 'createTopicStringFromAddress';
    const logName = `${EpSdkEpEventVersionsService.name}.${funcName}()`;
    if(address.addressType !== Address.addressType.TOPIC) throw new EpSdkFeatureNotSupportedError(logName, this.constructor.name, `only addressType=${Address.addressType.TOPIC} supported`, {
      address: address
    });
    let topicString = '';
    for(const addressLevel of address.addressLevels) {
      if(topicString.length > 0) topicString += '/';
      switch(addressLevel.addressLevelType) {
        case AddressLevel.addressLevelType.LITERAL:
          topicString += addressLevel.name;
          break;
        case AddressLevel.addressLevelType.VARIABLE:
          topicString += `{${addressLevel.name}}`;
          break;
        default:
          EpSdkUtils.assertNever(logName, addressLevel.addressLevelType);
      }
    }
    return topicString;
  }

  public deepCopyAddress = async({ address, fromApplicationDomainId, toApplicationDomainId }: {
    address: Address;
    fromApplicationDomainId: string;
    toApplicationDomainId: string;
  }): Promise<Address> => {
    const funcName = 'deepCopyAddress';
    const logName = `${EpSdkEpEventVersionsService.name}.${funcName}()`;

    if(address.addressType !== Address.addressType.TOPIC) throw new EpSdkFeatureNotSupportedError(logName, this.constructor.name, `only addressType=${Address.addressType.TOPIC} supported`, {
      address: address
    });
    const fromAddressLevels: Array<AddressLevel> = address.addressLevels;
    const targetAddressLevels: Array<AddressLevel> = [];
    for(const fromAddressLevel of fromAddressLevels) {
      if(fromAddressLevel.addressLevelType === AddressLevel.addressLevelType.VARIABLE && fromAddressLevel.enumVersionId !== undefined) {
        const targetEnumVersion: TopicAddressEnumVersion = await EpSdkEnumVersionsService.copyLastestVersionById_IfNotExists({
          enumVersionId: fromAddressLevel.enumVersionId,
          fromApplicationDomainId: fromApplicationDomainId,
          toApplicationDomainId: toApplicationDomainId,
        });
        const targetAddressLevel: AddressLevel = {
          addressLevelType: AddressLevel.addressLevelType.VARIABLE,
          name: fromAddressLevel.name,
          enumVersionId: targetEnumVersion.id
        };
        targetAddressLevels.push(targetAddressLevel);
      } else {
        targetAddressLevels.push(fromAddressLevel);
      }
    }
    const targetAddress: Address = {
      addressLevels: targetAddressLevels,
      addressType: address.addressType,
    };
    return targetAddress;
  }

  /**
   * Conditional deep copy of event version from 'fromApplicationDomain' to 'toApplicationDomain'. 
   * - copies all schemas and enums first
   * 
   * If an event version with the id already exists, returns that version. It still copies all schemas / enums.
   * 
   * @returns existing or created event version
   */
  public deepCopyLastestVersionById_IfNotExists = async({ eventVersionId, fromApplicationDomainId, toApplicationDomainId }: {
    eventVersionId: string;
    fromApplicationDomainId: string;
    toApplicationDomainId: string;
  }): Promise<EventVersion> => {
    const funcName = 'deepCopyLastestVersionById_IfNotExists';
    const logName = `${EpSdkEpEventVersionsService.name}.${funcName}()`;

    // get the source event version
    const fromEventVersionResponse: EventVersionResponse = await EventsService.getEventVersion({ 
      versionId: eventVersionId
    });
    if(fromEventVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromEventVersionResponse.data === undefined", {
      fromEventVersionResponse: fromEventVersionResponse
    });
    const fromEventVersion: EventVersion = fromEventVersionResponse.data;
    if(fromEventVersion.stateId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromEventVersion.stateId === undefined", {
      fromEventVersion: fromEventVersion
    });
    if(fromEventVersion.schemaVersionId === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromEventVersion.schemaVersionId === undefined", {
      fromEventVersion: fromEventVersion
    });
    // get the source event object
    const fromEvent: EpEvent = await EpSdkEpEventsService.getById({
      applicationDomainId: fromApplicationDomainId,
      eventId: fromEventVersion.eventId,
    });

    // copy the schema version
    const targetSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.copyLastestVersionById_IfNotExists({
      schemaVersionId: fromEventVersion.schemaVersionId,
      fromApplicationDomainId: fromApplicationDomainId,
      toApplicationDomainId: toApplicationDomainId,
    });
    if(targetSchemaVersion.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "targetSchemaVersion.id === undefined", {
      targetSchemaVersion: targetSchemaVersion
    });

    // copy all enums in address
    if(fromEventVersion.deliveryDescriptor === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromEventVersion.deliveryDescriptor === undefined", {
      fromEventVersion: fromEventVersion
    });
    if(fromEventVersion.deliveryDescriptor.address === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "fromEventVersion.deliveryDescriptor.address === undefined", {
      fromEventVersion: fromEventVersion
    });
    const fromEventVersionDeliveryDescriptorAddress: Address = fromEventVersion.deliveryDescriptor.address;
    const targetEventVersionDeliveryDescriptorAddress: Address = await this.deepCopyAddress({
      address: fromEventVersionDeliveryDescriptorAddress,
      fromApplicationDomainId: fromApplicationDomainId,
      toApplicationDomainId: toApplicationDomainId,
    });

    // ensure target event exists
    const epSdkEpEventTask = new EpSdkEpEventTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      eventName: fromEvent.name,
      eventObjectSettings: {
        shared: fromEvent.shared ? fromEvent.shared : true,
      },
    });
    const epSdkEpEventTask_ExecuteReturn: IEpSdkEpEventTask_ExecuteReturn = await epSdkEpEventTask.execute();
    if(epSdkEpEventTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action === EEpSdkTask_Action.NO_ACTION) {
      // return the latest version
      const targetEventVersion: EventVersion | undefined = await this.getLatestVersionForEventId({
        applicationDomainId: toApplicationDomainId,
        eventId: epSdkEpEventTask_ExecuteReturn.epObjectKeys.epObjectId,
      });
      if(targetEventVersion !== undefined) return targetEventVersion;
    }
    // create target event version
    const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
      epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
      applicationDomainId: toApplicationDomainId,
      eventId: epSdkEpEventTask_ExecuteReturn.epObjectKeys.epObjectId,
      versionString: fromEventVersion.version,
      versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
      topicString: this.createTopicStringFromAddress({ address: targetEventVersionDeliveryDescriptorAddress }),
      eventVersionSettings: {
        stateId: fromEventVersion.stateId,
        displayName: fromEventVersion.displayName ? fromEventVersion.displayName : fromEvent.name,
        description: fromEventVersion.description ? fromEventVersion.description : '',
        schemaVersionId: targetSchemaVersion.id,
      },
    });
    const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();
    // must get the object again, otherwise not all properties are set correctly
    if(epSdkEpEventVersionTask_ExecuteReturn.epObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epSdkEpEventVersionTask_ExecuteReturn.epObject.id === undefined', {
      epSdkEpEventVersionTask_ExecuteReturn: epSdkEpEventVersionTask_ExecuteReturn
    });
    const eventVersionResponse: EventVersionResponse =  await EventsService.getEventVersion({
      versionId: epSdkEpEventVersionTask_ExecuteReturn.epObject.id
    });
    if(eventVersionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventVersionResponse.data === undefined', {
      eventVersionResponse: eventVersionResponse
    });
    return eventVersionResponse.data;
  }

}

export default new EpSdkEpEventVersionsService();

