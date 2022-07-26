import {
  ApplicationDomain,
  ApplicationDomainResponse,
  ApplicationDomainsResponse,
  ApplicationDomainsService,
  Pagination,
} from '@solace-labs/ep-openapi-node';
import {
  EpSdkApiContentError,
  EpSdkServiceError,
  EpSdkLogger,
  EEpSdkLoggerCodes,
} from '../utils';
import { EpSdkService } from './EpSdkService';
import { EpApiHelpers } from '../internal-utils';

export class EpSdkApplicationDomainsService extends EpSdkService {

  public listAll = async({ pageSize = EpApiHelpers.MaxPageSize }:{
    pageSize?: number; /** for testing */
  }): Promise<ApplicationDomainsResponse> => {
    const funcName = 'listAll';
    const logName = `${EpSdkApplicationDomainsService.name}.${funcName}()`;

    const applicationDomainList: Array<ApplicationDomain> = [];
    
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {
      const applicationDomainsResponse: ApplicationDomainsResponse = await ApplicationDomainsService.getApplicationDomains({
        pageSize: pageSize,
        pageNumber: nextPage,
      });
      if(applicationDomainsResponse.data === undefined || applicationDomainsResponse.data.length === 0) nextPage = undefined;
      else {
        applicationDomainList.push(...applicationDomainsResponse.data);
        /* istanbul ignore next */
        if(applicationDomainsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'applicationDomainsResponse.meta === undefined', {
          applicationDomainsResponse: applicationDomainsResponse
        });
        /* istanbul ignore next */
        if(applicationDomainsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'applicationDomainsResponse.meta.pagination === undefined', {
          applicationDomainsResponse: applicationDomainsResponse
        });
        const pagination: Pagination = applicationDomainsResponse.meta.pagination;
        nextPage = pagination.nextPage;  
      }
    }
    const applicationDomainsResponse: ApplicationDomainsResponse = {
      data: applicationDomainList,
      meta: {
        pagination: {
          count: applicationDomainList.length,
        }
      }
    };
    return applicationDomainsResponse;
  }

  /**
   * Get application domain object by name.
   * @param object 
   * @returns ApplicationDomain - if found
   * @returns undefined - if not found
   * @throws {@link utils/EpSdkErrors.EpSdkApiContentError} - if more than 1 application domain exists with the same name
   */
  public getByName = async ({ applicationDomainName }: {
    applicationDomainName: string;
  }): Promise<ApplicationDomain | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkApplicationDomainsService.name}.${funcName}()`;

    const applicationDomainsResponse: ApplicationDomainsResponse = await ApplicationDomainsService.getApplicationDomains({
      name: applicationDomainName
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        applicationDomainsResponse: applicationDomainsResponse
      }
    }));

    if (applicationDomainsResponse.data === undefined || applicationDomainsResponse.data.length === 0) return undefined;
    /* istanbul ignore next */
    if (applicationDomainsResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationDomainsResponse.data.length > 1', {
      applicationDomainsResponse: applicationDomainsResponse
    });
    const applicationDomain: ApplicationDomain = applicationDomainsResponse.data[0];
    return applicationDomain;
  }

  /**
   * Get application domain object by id.
   * @param object 
   * @returns ApplicationDomain
   * @throws {@link utils/EpSdkErrors.EpSdkApiContentError} - if api response data is undefined
   */
  public getById = async ({ applicationDomainId }: {
    applicationDomainId: string;
  }): Promise<ApplicationDomain> => {
    const funcName = 'getById';
    const logName = `${EpSdkApplicationDomainsService.name}.${funcName}()`;

    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.getApplicationDomain({
      id: applicationDomainId,
    });
    /* istanbul ignore next */
    if (applicationDomainResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "applicationDomainResponse.data === undefined", {
      applicationDomainId: applicationDomainId
    });
    const applicationDomain: ApplicationDomain = applicationDomainResponse.data;
    return applicationDomain;
  }

  /**
   * Delete application domain object by id.
   * @param object 
   * @returns ApplicationDomain - the deleted application domain object
   */
  public deleteById = async ({ applicationDomainId }: {
    applicationDomainId: string;
  }): Promise<ApplicationDomain> => {
    const funcName = 'deleteById';
    const logName = `${EpSdkApplicationDomainsService.name}.${funcName}()`;

    const applicationDomain: ApplicationDomain = await this.getById({ applicationDomainId: applicationDomainId });

    const xvoid: void = await ApplicationDomainsService.deleteApplicationDomain({
      id: applicationDomainId,
    });

    return applicationDomain;

  }

  /**
   * Delete application domain object by name.
   * @param object 
   * @returns ApplicationDomain - the deleted application domain object
   * @throws {@link utils/EpSdkErrors.EpSdkServiceError} - if application domain does not exist
   */
  public deleteByName = async ({ applicationDomainName }: {
    applicationDomainName: string;
  }): Promise<ApplicationDomain> => {
    const funcName = 'deleteByName';
    const logName = `${EpSdkApplicationDomainsService.name}.${funcName}()`;

    const applicationDomain: ApplicationDomain | undefined = await this.getByName({ applicationDomainName: applicationDomainName });
    if (applicationDomain === undefined) throw new EpSdkServiceError(logName, this.constructor.name, "applicationDomain === undefined", {
      applicationDomainName: applicationDomainName
    });
    /* istanbul ignore next */
    if (applicationDomain.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'applicationDomain.id === undefined', {
      applicationDomain: applicationDomain,
    });
    const applicationDomainDeleted: ApplicationDomain = await this.deleteById({ applicationDomainId: applicationDomain.id });
    return applicationDomainDeleted;
  }

}
export default new EpSdkApplicationDomainsService();

