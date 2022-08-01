import { EpSdkApiContentError, EpSdkServiceError } from '../EpSdkErrors';
import { EpSdkLogger } from '../EpSdkLogger';
import { EEpSdkLoggerCodes } from '../EpSdkLoggerCodes';
import { 
  Event as EPEvent, 
  EventResponse, 
  EventsResponse,
  EventsService,
} from '../sep-openapi-node';
import { EpSdkService } from './EpSdkService';

class EpSdkEpEventsService extends EpSdkService {
  
  public getByName = async({ eventName, applicationDomainId }:{
    eventName: string;
    applicationDomainId: string;
  }): Promise<EPEvent | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkEpEventsService.name}.${funcName}()`;

    const eventsResponse: EventsResponse = await EventsService.getEvents({
      applicationDomainId: applicationDomainId,
      name: eventName
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      eventsResponse: eventsResponse
    }}));

    if(eventsResponse.data === undefined || eventsResponse.data.length === 0) return undefined;
    if(eventsResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name,'eventsResponse.data.length > 1', {    
      eventsResponse: eventsResponse
    });
    const epEvent: EPEvent = eventsResponse.data[0];
    return epEvent;
  }

  public getById = async({ eventId, applicationDomainId }:{
    eventId: string;
    applicationDomainId: string;
  }): Promise<EPEvent> => {
    const funcName = 'getById';
    const logName = `${EpSdkEpEventsService.name}.${funcName}()`;

    applicationDomainId;
    const eventResponse: EventResponse = await EventsService.getEvent({
      id: eventId
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      eventResponse: eventResponse
    }}));

    if(eventResponse.data === undefined) {
      throw new EpSdkApiContentError(logName, this.constructor.name, "eventResponse.data === undefined", {
        eventId: eventId
      });
    }
    const epEvent: EPEvent = eventResponse.data;
    return epEvent;  
  }

  public deleteById = async({ eventId, applicationDomainId }:{
    eventId: string;
    applicationDomainId: string;
  }): Promise<EPEvent> => {
    const funcName = 'deleteById';
    const logName = `${EpSdkEpEventsService.name}.${funcName}()`;

    const epEvent: EPEvent = await this.getById({ 
      applicationDomainId: applicationDomainId,
      eventId: eventId,
     });

    const xvoid: void = await EventsService.deleteEvent({ 
      id: eventId,
    });

    return epEvent;
  }

  public deleteByName = async({ applicationDomainId, eventName }: {
    eventName: string;
    applicationDomainId: string;
  }): Promise<EPEvent> => {
    const funcName = 'deleteByName';
    const logName = `${EpSdkEpEventsService.name}.${funcName}()`;
    
    const epEvent: EPEvent | undefined = await this.getByName({ 
      applicationDomainId: applicationDomainId,
      eventName: eventName,
     });
    if(epEvent === undefined) throw new EpSdkServiceError(logName, this.constructor.name, "epEvent === undefined", {
      applicationDomainId: applicationDomainId,
      eventName: eventName
    });
    if(epEvent.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epEvent.id === undefined', {
      epEvent: epEvent,
    });
    const epEventDeleted: EPEvent = await this.deleteById({ 
      applicationDomainId: applicationDomainId,
      eventId: epEvent.id
     });
    return epEventDeleted;
  }


}

export default new EpSdkEpEventsService();

