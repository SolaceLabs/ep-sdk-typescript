import { EpSdkApiContentError, EpSdkServiceError } from '../utils/EpSdkErrors';
import { EpSdkLogger } from '../utils/EpSdkLogger';
import { EEpSdkLoggerCodes } from '../utils/EpSdkLoggerCodes';
import { 
  EventApi,
  EventApiResponse,
  EventApisResponse, 
  EventApIsService, 
} from '@solace-labs/ep-openapi-node';
import { EpSdkService } from './EpSdkService';

export class EpSdkEventApisService extends EpSdkService {
  
  public getByName = async({ eventApiName, applicationDomainId }:{
    eventApiName: string;
    applicationDomainId: string;
  }): Promise<EventApi | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkEventApisService.name}.${funcName}()`;

    const eventApisResponse: EventApisResponse = await EventApIsService.getEventApis({
      applicationDomainId: applicationDomainId,
      name: eventApiName
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      eventApisResponse: eventApisResponse
    }}));

    if(eventApisResponse.data === undefined || eventApisResponse.data.length === 0) return undefined;
    /* istanbul ignore next */
    if(eventApisResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApisResponse.data.length > 1', {    
      eventApisResponse: eventApisResponse
    });
    const eventApi: EventApi = eventApisResponse.data[0];
    return eventApi;
  }

  public getById = async({ eventApiId, applicationDomainId }:{
    eventApiId: string;
    applicationDomainId: string;
  }): Promise<EventApi> => {
    const funcName = 'getById';
    const logName = `${EpSdkEventApisService.name}.${funcName}()`;

    applicationDomainId;
    const eventApiResponse: EventApiResponse = await EventApIsService.getEventApi({
      id: eventApiId
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      eventApiResponse: eventApiResponse
    }}));

    if(eventApiResponse.data === undefined) {
      /* istanbul ignore next */
      throw new EpSdkApiContentError(logName, this.constructor.name, "eventApiResponse.data === undefined", {
        eventApiId: eventApiId
      });
    }
    const eventApi: EventApi = eventApiResponse.data;
    return eventApi;
  }

  public deleteById = async({ eventApiId, applicationDomainId }:{
    eventApiId: string;
    applicationDomainId: string;
  }): Promise<EventApi> => {
    const funcName = 'deleteById';
    const logName = `${EpSdkEventApisService.name}.${funcName}()`;

    const eventApi: EventApi = await this.getById({ 
      applicationDomainId: applicationDomainId,
      eventApiId: eventApiId,
    });

    const xvoid: void = await EventApIsService.deleteEventApi({ 
      id: eventApiId,
    });

    return eventApi;
  }

  public deleteByName = async({ applicationDomainId, eventApiName }: {
    eventApiName: string;
    applicationDomainId: string;
  }): Promise<EventApi> => {
    const funcName = 'deleteByName';
    const logName = `${EpSdkEventApisService.name}.${funcName}()`;
    
    const eventApi: EventApi | undefined = await this.getByName({ 
      applicationDomainId: applicationDomainId,
      eventApiName: eventApiName,
     });
    if(eventApi === undefined) throw new EpSdkServiceError(logName, this.constructor.name, "eventApi === undefined", {
      applicationDomainId: applicationDomainId,
      eventApiName: eventApiName
    });
    /* istanbul ignore next */
    if(eventApi.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApi.id === undefined', {
      eventApi: eventApi,
    });
    const eventApiDeleted: EventApi = await this.deleteById({ 
      applicationDomainId: applicationDomainId,
      eventApiId: eventApi.id
     });
    return eventApiDeleted;
  }

}

export default new EpSdkEventApisService();

