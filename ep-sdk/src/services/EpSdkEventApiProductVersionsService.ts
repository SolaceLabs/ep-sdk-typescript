import { EpSdkVersionService } from "./EpSdkVersionService";
import { EpSdkApiContentError } from "../utils/EpSdkErrors";
import {
  EventApiProductsResponse,
  EventApiProduct,
  EventApiProductsService,
  EventApiProductVersionsResponse,
  EventApiProductVersion,
  Pagination,
} from '@solace-labs/ep-openapi-node';
import { EpApiHelpers } from "../internal-utils/EpApiHelpers";
import { EpSdkBrokerType } from './EpSdkService';
import EpSdkEventApiProductsService from './EpSdkEventApiProductsService';

class EpSdkEventApiProductVersionsService extends EpSdkVersionService {

  public listAll_LatestVersions = async({ applicationDomainIds, shared, brokerType, stateId }:{
    applicationDomainIds?: Array<string>;
    shared: boolean;
    brokerType?: EpSdkBrokerType;
    stateId?: string;
  }): Promise<Array<EventApiProductVersion>> => {
    const funcName = 'list';
    const logName = `${EpSdkEventApiProductVersionsService.name}.${funcName}()`;

    // get a list of all event api products
    const eventApiProductsResponse: EventApiProductsResponse = await EpSdkEventApiProductsService.listAll({
      applicationDomainIds: applicationDomainIds,
      shared: shared,
      brokerType: brokerType
    });
    const eventApiProductList: Array<EventApiProduct> = eventApiProductsResponse.data ? eventApiProductsResponse.data : [];
    // get latest version for each event api product
    const latest_EventApiProductVersionList: Array<EventApiProductVersion> = [];
    for(const eventApiProduct of eventApiProductList) {
      if(eventApiProduct.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiProduct.id === undefined', {
        eventApiProduct: eventApiProduct
      });
      // get the latest version
      const latest_EventApiProductVersion: EventApiProductVersion | undefined = await this.getLatestVersionForEventApiProductId({
        eventApiProductId: eventApiProduct.id,
        stateId: stateId
      });
      if(latest_EventApiProductVersion !== undefined) latest_EventApiProductVersionList.push(latest_EventApiProductVersion);
    }
    return latest_EventApiProductVersionList;
  }

  // public getVersionByVersion = async ({ eventApiId, eventApiVersionString }: {
  //   eventApiId: string;
  //   eventApiVersionString: string;
  // }): Promise<EventApiVersion | undefined> => {
  //   const funcName = 'getVersionByVersion';
  //   const logName = `${EpSdkEventApiVersionsService.name}.${funcName}()`;

  //   const eventApiVersionList: Array<EventApiVersion> = await this.getVersionsForEventApiId({ eventApiId: eventApiId });
  //   const found: EventApiVersion | undefined = eventApiVersionList.find( (eventApiVersion: EventApiVersion ) => {
  //     if(eventApiVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiVersion.version === undefined', {
  //       eventApiVersion: eventApiVersion
  //     });
  //     return eventApiVersion.version === eventApiVersionString;
  //   });
  //   return found;
  // }

  public getVersionsForEventApiProductId = async ({ eventApiProductId, stateId, pageSize = EpApiHelpers.MaxPageSize }: {
    eventApiProductId: string;
    stateId?: string;
    pageSize?: number; /** for testing */
  }): Promise<Array<EventApiProductVersion>> => {
    const funcName = 'getVersionsForEventApiProductId';
    const logName = `${EpSdkEventApiProductVersionsService.name}.${funcName}()`;

    const eventApiProductVersionList: Array<EventApiProductVersion> = [];
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {

      // WORKAROUND_BACKWARDS_COMPATIBILITY_PAGING
      const params: any = {
        pageSize: pageSize,
        pageNumber: nextPage
      };
      
      const eventApiProductVersionsResponse: EventApiProductVersionsResponse = await EventApiProductsService.getEventApiProductVersionsForEventApiProduct({
        eventApiProductId: eventApiProductId,
        stateId: stateId,
        ...params
      });

      if(eventApiProductVersionsResponse.data === undefined || eventApiProductVersionsResponse.data.length === 0) nextPage = null;
      else {
        eventApiProductVersionList.push(...eventApiProductVersionsResponse.data);
        if(eventApiProductVersionsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiProductVersionsResponse.meta === undefined', {
          eventApiProductVersionsResponse: eventApiProductVersionsResponse
        });
        if(eventApiProductVersionsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiProductVersionsResponse.meta.pagination === undefined', {
          eventApiProductVersionsResponse: eventApiProductVersionsResponse
        });
        const pagination: Pagination = eventApiProductVersionsResponse.meta.pagination;
        nextPage = pagination.nextPage;  
      }
    }
    return eventApiProductVersionList;
  }

  // public getVersionsForEventApiName = async ({ eventApiName, applicationDomainId }: {
  //   applicationDomainId: string;
  //   eventApiName: string;
  // }): Promise<Array<EventApiVersion>> => {
  //   const funcName = 'getVersionsForEventName';
  //   const logName = `${EpSdkEventApiVersionsService.name}.${funcName}()`;

  //   const eventApi: EventApi | undefined = await EpSdkEventApisService.getByName({
  //     applicationDomainId: applicationDomainId,
  //     eventApiName: eventApiName,
  //   });

  //   if (eventApi === undefined) return [];
  //   if (eventApi.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApi.id === undefined', {
  //     eventApi: eventApi
  //   });
  //   const eventApiVersionList: Array<EventApi> = await this.getVersionsForEventApiId({ eventApiId: eventApi.id });
  //   return eventApiVersionList;
  // }

  // public getLatestVersionString = async ({ eventApiId }: {
  //   eventApiId: string;
  // }): Promise<string | undefined> => {
  //   const funcName = 'getLatestVersionString';
  //   const logName = `${EpSdkEventApiVersionsService.name}.${funcName}()`;

  //   const eventApiVersionList: Array<EventApiVersion> = await this.getVersionsForEventApiId({ eventApiId: eventApiId });
  //   // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
  //   //   enumVersionList: enumVersionList
  //   // }}));
  //   const latestEventVersion: EventApiVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventApiVersionList });
  //   if(latestEventVersion === undefined) return undefined;
  //   if(latestEventVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'latestEventVersion.version === undefined', {
  //     latestEventVersion: latestEventVersion
  //   });
  //   return latestEventVersion.version;
  // }

  public getLatestVersionForEventApiProductId = async ({ eventApiProductId, stateId }: {
    eventApiProductId: string;
    stateId?: string;
  }): Promise<EventApiProductVersion | undefined> => {
    // const funcName = 'getLatestVersionForEventApiProductId';
    // const logName = `${EpSdkEventApiProductVersionsService.name}.${funcName}()`;

    const eventApiProductVersionList: Array<EventApiProductVersion> = await this.getVersionsForEventApiProductId({
      eventApiProductId: eventApiProductId,
      stateId: stateId
    });

    const latest_EventApiProductVersion: EventApiProductVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventApiProductVersionList });
    return latest_EventApiProductVersion;
  }

  // public getLatestVersionForEventApiName = async ({ applicationDomainId, eventApiName }: {
  //   applicationDomainId: string;
  //   eventApiName: string;
  // }): Promise<EventApiVersion | undefined> => {
  //   const funcName = 'getLatestVersionForEventApiName';
  //   const logName = `${EpSdkEventApiVersionsService.name}.${funcName}()`;

  //   const eventApiVersionList: Array<EventApiVersion> = await this.getVersionsForEventApiName({
  //     eventApiName: eventApiName,
  //     applicationDomainId: applicationDomainId
  //   });
  //   // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
  //   //   enumVersionList: enumVersionList
  //   // }}));

  //   const latestEventApiVersion: EventApiVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventApiVersionList });
  //   return latestEventApiVersion;
  // }

}

export default new EpSdkEventApiProductVersionsService();

