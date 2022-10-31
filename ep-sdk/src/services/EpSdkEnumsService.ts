import { EpSdkApiContentError, EpSdkServiceError } from '../utils/EpSdkErrors';
import { EpSdkLogger } from '../utils/EpSdkLogger';
import { EEpSdkLoggerCodes } from '../utils/EpSdkLoggerCodes';
import {
  EnumsService, 
  TopicAddressEnum,
  TopicAddressEnumResponse, 
  TopicAddressEnumsResponse,
} from '@solace-labs/ep-openapi-node';
import { EpSdkService } from './EpSdkService';

export class EpSdkEnumsService extends EpSdkService {

  public getByName = async ({ enumName, applicationDomainId }: {
    enumName: string;
    applicationDomainId: string;
  }): Promise<TopicAddressEnum | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkEnumsService.name}.${funcName}()`;

    const topicAddressEnumsResponse: TopicAddressEnumsResponse = await EnumsService.getEnums({
      applicationDomainId: applicationDomainId,
      names: [enumName]
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        topicAddressEnumsResponse: topicAddressEnumsResponse
      }
    }));

    if (topicAddressEnumsResponse.data === undefined || topicAddressEnumsResponse.data.length === 0) return undefined;
    /* istanbul ignore next */
    if (topicAddressEnumsResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name, 'topicAddressEnumsResponse.data.length > 1', {
      topicAddressEnumsResponse: topicAddressEnumsResponse
    });
    const topicAddressEnum: TopicAddressEnum = topicAddressEnumsResponse.data[0];
    return topicAddressEnum;
  }

  // public getByIdIfExists  = async ({ enumId, applicationDomainId }: {
  //   enumId: string;
  //   applicationDomainId: string;
  // }): Promise<TopicAddressEnum | undefined> => {
  //   const funcName = 'getByIdIfExists';
  //   const logName = `${EpSdkEnumsService.name}.${funcName}()`;
  //   try {
  //     return this.getById({
  //       applicationDomainId: applicationDomainId,
  //       enumId: enumId,
  //     });
  //   } catch(e) {
  //     return undefined;
  //   }
  // }
  
  public getById = async ({ enumId, applicationDomainId }: {
    enumId: string;
    applicationDomainId: string;
  }): Promise<TopicAddressEnum> => {
    const funcName = 'getById';
    const logName = `${EpSdkEnumsService.name}.${funcName}()`;

    applicationDomainId;
    const topicAddressEnumResponse: TopicAddressEnumResponse = await EnumsService.getEnum({
      id: enumId
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        topicAddressEnumResponse: topicAddressEnumResponse
      }
    }));

    /* istanbul ignore next */
    if (topicAddressEnumResponse.data === undefined) {
      throw new EpSdkApiContentError(logName, this.constructor.name, "topicAddressEnumResponse.data === undefined", {
        enumId: enumId
      });
    }
    const topicAddressEnum: TopicAddressEnum = topicAddressEnumResponse.data;
    return topicAddressEnum;
  }

  public deleteById = async ({ enumId, applicationDomainId }: {
    enumId: string;
    applicationDomainId: string;
  }): Promise<TopicAddressEnum> => {
    const funcName = 'deleteById';
    const logName = `${EpSdkEnumsService.name}.${funcName}()`;

    const topicAddressEnum: TopicAddressEnum = await this.getById({
      applicationDomainId: applicationDomainId,
      enumId: enumId,
    });

    const xvoid: void = await EnumsService.deleteEnum({
      id: enumId,
    });

    return topicAddressEnum;
  }

  public deleteByName = async ({ applicationDomainId, enumName }: {
    enumName: string;
    applicationDomainId: string;
  }): Promise<TopicAddressEnum> => {
    const funcName = 'deleteByName';
    const logName = `${EpSdkEnumsService.name}.${funcName}()`;

    const topicAddressEnum: TopicAddressEnum | undefined = await this.getByName({
      applicationDomainId: applicationDomainId,
      enumName: enumName,
    });
    if (topicAddressEnum === undefined) throw new EpSdkServiceError(logName, this.constructor.name, "topicAddressEnum === undefined", {
      applicationDomainId: applicationDomainId,
      enumName: enumName
    });
    /* istanbul ignore next */
    if (topicAddressEnum.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'topicAddressEnum.id === undefined', {
      topicAddressEnum: topicAddressEnum,
    });
    const deleted: TopicAddressEnum = await this.deleteById({
      applicationDomainId: applicationDomainId,
      enumId: topicAddressEnum.id
    });
    return deleted;
  }


}

export default new EpSdkEnumsService();

