import {
  Application,
  ApplicationResponse,
  ApplicationsResponse,
  ApplicationsService,
  Pagination,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkApiContentError, 
  EpSdkServiceError,
  EpSdkLogger,
  EEpSdkLoggerCodes
} from '../utils';
import { EpSdkService } from './EpSdkService';
import { EpApiHelpers } from '../internal-utils';

export class EpSdkApplicationsService extends EpSdkService {

  private listAllForApplicationDomainId = async({ applicationDomainId }:{
    applicationDomainId?: string;
  }): Promise<ApplicationsResponse> => {
    const funcName = 'listAllForApplicationDomainId';
    const logName = `${EpSdkApplicationsService.name}.${funcName}()`;

    const applicationList: Array<Application> = [];
    
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {

      const applicationsResponse: ApplicationsResponse = await ApplicationsService.getApplications({
        applicationDomainId: applicationDomainId,
        pageSize: EpApiHelpers.MaxPageSize,
        pageNumber: nextPage,
      });
      if(applicationsResponse.data === undefined || applicationsResponse.data.length === 0) nextPage = undefined;
      else {
        applicationList.push(...applicationsResponse.data);
        /* istanbul ignore next */
        if(applicationsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'applicationsResponse.meta === undefined', {
          applicationsResponse: applicationsResponse
        });
        /* istanbul ignore next */
        if(applicationsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'applicationsResponse.meta.pagination === undefined', {
          applicationsResponse: applicationsResponse
        });
        const pagination: Pagination = applicationsResponse.meta.pagination;
        nextPage = pagination.nextPage;  
      }
    }
    const applicationsResponse: ApplicationsResponse = {
      data: applicationList,
      meta: {
        pagination: {
          count: applicationList.length,
        }
      }
    };
    return applicationsResponse;
  }

  /**
   * Retrieves a list of all Applications without paging.
   * @param param0 
   */
  public listAll = async({ applicationDomainIds, sortFieldName }:{
    applicationDomainIds?: Array<string>;
    sortFieldName?: string;
  }): Promise<ApplicationsResponse> => {
    const funcName = 'listAll';
    const logName = `${EpSdkApplicationsService.name}.${funcName}()`;

    const applicationList: Array<Application> = [];
    
    if(applicationDomainIds) {
      for(const applicationDomainId of applicationDomainIds) {
        const applicationsResponse: ApplicationsResponse = await this.listAllForApplicationDomainId({
          applicationDomainId: applicationDomainId
        });
        if(applicationsResponse.data) applicationList.push(...applicationsResponse.data);
      }
    } else {
      const applicationsResponse: ApplicationsResponse = await this.listAllForApplicationDomainId({});
      if(applicationsResponse.data) applicationList.push(...applicationsResponse.data);
    }
    // TODO: sort by sortFieldName
    sortFieldName;
    const applicationsResponse: ApplicationsResponse = {
      data: applicationList,
      meta: {
        pagination: {
          count: applicationList.length,
        }
      }
    };
    return applicationsResponse;
  }

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
    /* istanbul ignore next */
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

    /* istanbul ignore next */
    if (applicationResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "applicationResponse.data === undefined", {
      applicationId: applicationId
    });
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
    /* istanbul ignore next */
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

