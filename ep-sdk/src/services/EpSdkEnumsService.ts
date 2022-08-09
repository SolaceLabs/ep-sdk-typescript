import { EpSdkApiContentError, EpSdkServiceError } from '../utils/EpSdkErrors';
import { EpSdkLogger } from '../utils/EpSdkLogger';
import { EEpSdkLoggerCodes } from '../utils/EpSdkLoggerCodes';
import {
  Enum,
  EnumResponse,
  EnumsResponse,
  EnumsService,
} from '@solace-labs/ep-openapi-node';
import { EpSdkService } from './EpSdkService';

export class EpSdkEnumsService extends EpSdkService {

  public getByName = async ({ enumName, applicationDomainId }: {
    enumName: string;
    applicationDomainId: string;
  }): Promise<Enum | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkEnumsService.name}.${funcName}()`;

    const enumsResponse: EnumsResponse = await EnumsService.getEnums({
      applicationDomainId: applicationDomainId,
      names: [enumName]
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        enumsResponse: enumsResponse
      }
    }));

    if (enumsResponse.data === undefined || enumsResponse.data.length === 0) return undefined;
    if (enumsResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name, 'enumsResponse.data.length > 1', {
      enumsResponse: enumsResponse
    });
    const epEnum: Enum = enumsResponse.data[0];
    return epEnum;
  }

  public getById = async ({ enumId, applicationDomainId }: {
    enumId: string;
    applicationDomainId: string;
  }): Promise<Enum> => {
    const funcName = 'getById';
    const logName = `${EpSdkEnumsService.name}.${funcName}()`;

    applicationDomainId;
    const enumResponse: EnumResponse = await EnumsService.getEnum({
      id: enumId
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        enumResponse: enumResponse
      }
    }));

    if (enumResponse.data === undefined) {
      throw new EpSdkApiContentError(logName, this.constructor.name, "enumResponse.data === undefined", {
        enumId: enumId
      });
    }
    const epEnum: Enum = enumResponse.data;
    return epEnum;
  }

  public deleteById = async ({ enumId, applicationDomainId }: {
    enumId: string;
    applicationDomainId: string;
  }): Promise<Enum> => {
    const funcName = 'deleteById';
    const logName = `${EpSdkEnumsService.name}.${funcName}()`;

    const epEnum: Enum = await this.getById({
      applicationDomainId: applicationDomainId,
      enumId: enumId,
    });

    const xvoid: void = await EnumsService.deleteEnum({
      id: enumId,
    });

    return epEnum;
  }

  public deleteByName = async ({ applicationDomainId, enumName }: {
    enumName: string;
    applicationDomainId: string;
  }): Promise<Enum> => {
    const funcName = 'deleteByName';
    const logName = `${EpSdkEnumsService.name}.${funcName}()`;

    const epEnum: Enum | undefined = await this.getByName({
      applicationDomainId: applicationDomainId,
      enumName: enumName,
    });
    if (epEnum === undefined) throw new EpSdkServiceError(logName, this.constructor.name, "epEnum === undefined", {
      applicationDomainId: applicationDomainId,
      enumName: enumName
    });
    if (epEnum.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epEnum.id === undefined', {
      epEnum: epEnum,
    });
    const epEnumDeleted: Enum = await this.deleteById({
      applicationDomainId: applicationDomainId,
      enumId: epEnum.id
    });
    return epEnumDeleted;
  }


}

export default new EpSdkEnumsService();

