import { EpSdkApiContentError, EpSdkServiceError } from '../EpSdkErrors';
import { EpSdkLogger } from '../EpSdkLogger';
import { 
  ApplicationDomain,
  ApplicationDomainResponse,
  ApplicationDomainsResponse,
  ApplicationDomainsService,
} from '../sep-openapi-node';
import { EpSdkService } from './EpSdkService';

class EpSdkApplicationDomainsService extends EpSdkService {

  public getByName = async({ applicationDomainName }:{
    applicationDomainName: string;
  }): Promise<ApplicationDomain | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkApplicationDomainsService.name}.${funcName}()`;

    const applicationDomainsResponse: ApplicationDomainsResponse = await ApplicationDomainsService.getApplicationDomains({
      name: applicationDomainName
    });
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: 'SERVICE', details: {
      applicationDomainsResponse: applicationDomainsResponse
    }}));

    if(applicationDomainsResponse.data === undefined || applicationDomainsResponse.data.length === 0) return undefined;
    if(applicationDomainsResponse.data.length > 1) throw new EpSdkApiContentError(logName, 'applicationDomainsResponse.data.length > 1', {
      applicationDomainsResponse: applicationDomainsResponse
    });
    const applicationDomain: ApplicationDomain = applicationDomainsResponse.data[0];
    return applicationDomain;  
  }

  public getById = async({ applicationDomainId }:{
    applicationDomainId: string;
  }): Promise<ApplicationDomain> => {
    const funcName = 'getById';
    const logName = `${EpSdkApplicationDomainsService.name}.${funcName}()`;

    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.getApplicationDomain({ 
      id: applicationDomainId,
    });
    if(applicationDomainResponse.data === undefined) {
      throw new EpSdkApiContentError(logName, "applicationDomainResponse.data === undefined", {
        applicationDomainId: applicationDomainId
      });
    }
    const applicationDomain: ApplicationDomain = applicationDomainResponse.data;
    return applicationDomain;  
  }

  public deleteById = async({ applicationDomainId }:{
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

  public deleteByName = async({ applicationDomainName }: {
    applicationDomainName: string;
  }): Promise<ApplicationDomain> => {
    const funcName = 'deleteByName';
    const logName = `${EpSdkApplicationDomainsService.name}.${funcName}()`;
    
    const applicationDomain: ApplicationDomain | undefined = await this.getByName({ applicationDomainName: applicationDomainName });
    if(applicationDomain === undefined) throw new EpSdkServiceError(logName, "applicationDomain === undefined", {
      applicationDomainName: applicationDomainName
    });
    if(applicationDomain.id === undefined) throw new EpSdkApiContentError(logName, 'applicationDomain.id === undefined', {
      applicationDomain: applicationDomain,
    });
    const applicationDomainDeleted: ApplicationDomain = await this.deleteById({ applicationDomainId: applicationDomain.id });
    return applicationDomainDeleted;
  }

}

export default new EpSdkApplicationDomainsService();
