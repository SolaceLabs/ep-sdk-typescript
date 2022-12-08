import { 
  EpSdkApiContentError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
 } from '../utils';
import {
  MessagingService, 
  MessagingServiceResponse, 
  MessagingServicesService, 
} from '@solace-labs/ep-openapi-node';
import { EpSdkService } from './EpSdkService';

export class EpSdkMessagingService extends EpSdkService {

  public getById = async ({ messagingServiceId }: {
    messagingServiceId: string;
  }): Promise<MessagingService> => {
    const funcName = 'getById';
    const logName = `${EpSdkMessagingService.name}.${funcName}()`;

    const messagingServiceResponse: MessagingServiceResponse = await MessagingServicesService.getMessagingService({ 
      id: messagingServiceId,
    });
    /* istanbul ignore next */
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        messagingServiceResponse: messagingServiceResponse
      }
    }));

    /* istanbul ignore next */
    if (messagingServiceResponse.data === undefined) {
      throw new EpSdkApiContentError(logName, this.constructor.name, "messagingServiceResponse.data === undefined", {
        messagingServiceId: messagingServiceId
      });
    }
    return messagingServiceResponse.data;
  }

}

export default new EpSdkMessagingService();

