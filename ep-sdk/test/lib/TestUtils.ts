import { 
  Address, 
  AddressLevel, 
  DeliveryDescriptor, 
  EventResponse, 
  EventsService, 
  EventVersion, 
  SchemaResponse, 
  SchemasService, 
  SchemaVersion,
} from '@solace-labs/ep-openapi-node';
import { v4 as uuidv4 } from 'uuid';
import EpSdkEpEventVersionsService from '../../src/services/EpSdkEpEventVersionsService';
import { EEpSdkSchemaContentType, EEpSdkSchemaType } from '../../src/services/EpSdkSchemasService';
import EpSdkSchemaVersionsService from '../../src/services/EpSdkSchemaVersionsService';


// use with // @ts-ignore if getting Type instantiation is excessively deep and possibly infinite.  TS2589
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
type DotNestedKeys<T> = (T extends object ?
    { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : "") extends infer D ? Extract<D, string> : never;
type DeepPartial<T> = T extends object ? {
      [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export class TestUtils {

  public static nameOf<T>(name: DotNestedKeys<DeepPartial<T>>) {
    return name;
  }

  public static getUUID = (): string => {
    return uuidv4();
  }

  public static createEventVersion = async({ applicationDomainId, stateId }:{
    applicationDomainId: string;
    stateId: string;
  }): Promise<EventVersion> => {

    const schemaResponse: SchemaResponse = await SchemasService.createSchema({
      requestBody: {
        applicationDomainId: applicationDomainId,
        name: "SchemaName",
        schemaType: EEpSdkSchemaType.JSON_SCHEMA,
        contentType: EEpSdkSchemaContentType.APPLICATION_JSON,
        shared: true
      }
    });
    const createSchemaVersion: SchemaVersion = {
      schemaId: schemaResponse.data.id,
      version: "0.1.0",
    };
    const createdSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.createSchemaVersion({
      applicationDomainId: applicationDomainId,
      schemaId: schemaResponse.data.id,
      schemaVersion: createSchemaVersion,
      targetLifecycleStateId: stateId
    });
    const eventResponse: EventResponse = await EventsService.createEvent({
      requestBody: {
        applicationDomainId: applicationDomainId,
        name: "EventName",
        shared: true,          
      }
    });
    const eventVersionDeliveryDescriptor: DeliveryDescriptor = {
      brokerType: "solace",
      address: {
        addressType: Address.addressType.TOPIC,
        addressLevels: [
          { addressLevelType: AddressLevel.addressLevelType.LITERAL, name: applicationDomainId },
          { addressLevelType: AddressLevel.addressLevelType.LITERAL, name: 'hello' },
          { addressLevelType: AddressLevel.addressLevelType.LITERAL, name: 'world' },
        ]
      }
    };    
    const createEventVersion: EventVersion = {
      eventId: eventResponse.data.id,
      version: "0.1.0",
      schemaVersionId: createdSchemaVersion.id,
      deliveryDescriptor: eventVersionDeliveryDescriptor,
    };
    const createdEventVersion: EventVersion = await EpSdkEpEventVersionsService.createEventVersion({
      applicationDomainId: applicationDomainId,
      eventId: eventResponse.data.id,
      eventVersion: createEventVersion,
      targetLifecycleStateId: stateId
    });    
    return createdEventVersion;
  }

}