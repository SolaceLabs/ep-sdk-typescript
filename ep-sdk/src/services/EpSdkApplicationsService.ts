import { EpSdkApiContentError, EpSdkServiceError } from '../utils/EpSdkErrors';
import { EpSdkLogger } from '../utils/EpSdkLogger';
import { EEpSdkLoggerCodes } from '../utils/EpSdkLoggerCodes';
import {
  Application,
  ApplicationResponse,
  ApplicationsResponse,
  ApplicationsService,
} from '@solace-labs/ep-openapi-node';
import { EpSdkService } from './EpSdkService';

export class EpSdkApplicationsService extends EpSdkService {

  public getByName = async ({ applicationName, applicationDomainId }: {
    applicationName: string;
    applicationDomainId: string;
  }): Promise<Application | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkApplicationsService.name}.${funcName}()`;

    const applicationsResponse: ApplicationsResponse = await ApplicationsService.getApplications({
      applicationDomainId: applicationDomainId,
      name: applicationName
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        applicationsResponse: applicationsResponse
      }
    }));

    if (applicationsResponse.data === undefined || applicationsResponse.data.length === 0) return undefined;
    if (applicationsResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationsResponse.data.length > 1', {
      applicationsResponse: applicationsResponse
    });
    const epApplication: Application = applicationsResponse.data[0];
    return epApplication;
  }

  public getById = async ({ applicationId, applicationDomainId }: {
    applicationId: string;
    applicationDomainId: string;
  }): Promise<Application> => {
    const funcName = 'getById';
    const logName = `${EpSdkApplicationsService.name}.${funcName}()`;

    applicationDomainId;
    const applicationResponse: ApplicationResponse = await ApplicationsService.getApplication({
      id: applicationId
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        applicationResponse: applicationResponse
      }
    }));

    if (applicationResponse.data === undefined) {
      throw new EpSdkApiContentError(logName, this.constructor.name, "applicationResponse.data === undefined", {
        applicationId: applicationId
      });
    }
    const epApplication: Application = applicationResponse.data;
    return epApplication;
  }

  public deleteById = async ({ applicationId, applicationDomainId }: {
    applicationId: string;
    applicationDomainId: string;
  }): Promise<Application> => {
    const funcName = 'deleteById';
    const logName = `${EpSdkApplicationsService.name}.${funcName}()`;

    const epApplication: Application = await this.getById({
      applicationDomainId: applicationDomainId,
      applicationId: applicationId,
    });

    const xvoid: void = await ApplicationsService.deleteApplication({
      id: applicationId,
    });

    return epApplication;
  }

  public deleteByName = async ({ applicationDomainId, applicationName }: {
    applicationName: string;
    applicationDomainId: string;
  }): Promise<Application> => {
    const funcName = 'deleteByName';
    const logName = `${EpSdkApplicationsService.name}.${funcName}()`;

    const epApplication: Application | undefined = await this.getByName({
      applicationDomainId: applicationDomainId,
      applicationName: applicationName,
    });
    if (epApplication === undefined) throw new EpSdkServiceError(logName, this.constructor.name, "epApplication === undefined", {
      applicationDomainId: applicationDomainId,
      applicationName: applicationName
    });
    if (epApplication.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epApplication.id === undefined', {
      epApplication: epApplication,
    });
    const epApplicationDeleted: Application = await this.deleteById({
      applicationDomainId: applicationDomainId,
      applicationId: epApplication.id
    });
    return epApplicationDeleted;
  }


}

export default new EpSdkApplicationsService();

