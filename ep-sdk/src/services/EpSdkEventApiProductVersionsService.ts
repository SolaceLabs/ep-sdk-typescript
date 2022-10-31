import { EpSdkVersionService } from "./EpSdkVersionService";
import { EpSdkApiContentError } from "../utils/EpSdkErrors";
import {
  EventApiProductsResponse,
  EventApiProduct,
  EventApiProductsService,
  EventApiProductVersionsResponse,
  EventApiProductVersion,
  Pagination,
  EventApiProductResponse,
} from '@solace-labs/ep-openapi-node';
import { EpApiHelpers } from "../internal-utils/EpApiHelpers";
import { EpSdkBrokerType } from './EpSdkService';
import EpSdkEventApiProductsService from './EpSdkEventApiProductsService';
import { EpSdkPagination } from "../types";


export type EpSdkEventApiProduct = Required<Pick<EventApiProduct, "applicationDomainId" | "id" | "name">> & Omit<EventApiProduct, "applicationDomainId" | "id" | "name">;
export type EpSdkEventApiProductVersion = Required<Pick<EventApiProductVersion, "id" | "eventApiProductId" | "version" | "stateId">> & Omit<EventApiProductVersion, "id" | "eventApiProductId" | "version" | "stateId">;

export type EpSdkEventApiProductVersionList = Array<EpSdkEventApiProductVersion>;
export type EpSdkEventApiProductAndVersion = {
  eventApiProduct: EpSdkEventApiProduct;
  eventApiProductVersion: EpSdkEventApiProductVersion;
}
export type EpSdkEventApiProductAndVersionList = Array<EpSdkEventApiProductAndVersion>;
export type EpSdkEventApiProductAndVersionListResponse = {
  data: EpSdkEventApiProductAndVersionList;
  meta: {
    pagination: EpSdkPagination;
  }
}
export type EpSdkEventApiProductAndVersionResponse = EpSdkEventApiProductAndVersion & {
  meta: {
    versionStringList: Array<string>;
  }
}
export class EpSdkEventApiProductVersionsService extends EpSdkVersionService {

  private getLatestVersionObjectForEventApiProductId = async ({ eventApiProductId, stateId }: {
    eventApiProductId: string;
    stateId?: string;
  }): Promise<EventApiProductVersion | undefined> => {
    // const funcName = 'getLatestVersionObjectForEventApiProductId';
    // const logName = `${EpSdkEventApiProductVersionsService.name}.${funcName}()`;

    // get all versions for selected stateId
    const eventApiProductVersionList: Array<EventApiProductVersion> = await this.getVersionsForEventApiProductId({
      eventApiProductId: eventApiProductId,
      stateId: stateId,
    });
    // extract the latest version
    const latest_EventApiProductVersion: EventApiProductVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventApiProductVersionList });
    return latest_EventApiProductVersion;
  }

  public listLatestVersions = async({ applicationDomainIds, shared, brokerType, stateId, pageNumber = 1, pageSize = 20, sortFieldName }:{
    applicationDomainIds?: Array<string>;
    shared: boolean;
    brokerType?: EpSdkBrokerType;
    stateId?: string;
    pageNumber?: number;
    pageSize?: number;
    sortFieldName?: string;
  }): Promise<EpSdkEventApiProductAndVersionListResponse> => {
    const funcName = 'listLatestVersions';
    const logName = `${EpSdkEventApiProductVersionsService.name}.${funcName}()`;

    // get all api products:
    // - we may have eventApiProducts without a version in the state requested
    const eventApiProductsResponse: EventApiProductsResponse = await EpSdkEventApiProductsService.listAll({
      applicationDomainIds: applicationDomainIds,
      shared: shared,
      brokerType: brokerType,
      sortFieldName: sortFieldName,
    });
    const eventApiProductList: Array<EventApiProduct> = eventApiProductsResponse.data ? eventApiProductsResponse.data : [];

    // create the complete list
    const complete_EpSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = [];
    for(const eventApiProduct of eventApiProductList) {
      /* istanbul ignore next */
      if(eventApiProduct.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiProduct.id === undefined', {
        eventApiProduct: eventApiProduct
      });
      // get the latest version in the requested state
      const latest_EventApiProductVersion: EventApiProductVersion | undefined = await this.getLatestVersionObjectForEventApiProductId({
        eventApiProductId: eventApiProduct.id,
        stateId: stateId
      });      
      if(latest_EventApiProductVersion !== undefined) complete_EpSdkEventApiProductAndVersionList.push({
        eventApiProduct: eventApiProduct as EpSdkEventApiProduct,
        eventApiProductVersion: latest_EventApiProductVersion as EpSdkEventApiProductVersion
      });
    }
    // extract the page
    const startIdx = (pageSize * (pageNumber-1));
    const endIdx = (startIdx + pageSize);
    const epSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = complete_EpSdkEventApiProductAndVersionList.slice(startIdx, endIdx);
    const nextPage: number | undefined = endIdx < complete_EpSdkEventApiProductAndVersionList.length ? (pageNumber + 1) : undefined;

    return {
      data: epSdkEventApiProductAndVersionList,
      meta: {
        pagination: {
          count: complete_EpSdkEventApiProductAndVersionList.length,
          pageNumber: pageNumber,
          nextPage: nextPage
        }
      } 
    };
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
        /* istanbul ignore next */
        if(eventApiProductVersionsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiProductVersionsResponse.meta === undefined', {
          eventApiProductVersionsResponse: eventApiProductVersionsResponse
        });
        /* istanbul ignore next */
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


  /**
   * Retrieves Event API Product Version object in the given stateId.
   * If versionString is omitted, retrieves the latest version.
   * @param param0 
   * @returns 
   */
  public getVersionForEventApiProductId = async ({ eventApiProductId, stateId, versionString }: {
    eventApiProductId: string;
    stateId?: string;
    versionString?: string;
  }): Promise<EpSdkEventApiProductAndVersionResponse | undefined> => {
    const funcName = 'getLatestVersionForEventApiProductId';
    const logName = `${EpSdkEventApiProductVersionsService.name}.${funcName}()`;

    // get event api product
    let eventApiProductResponse: EventApiProductResponse;
    try {
      eventApiProductResponse = await EventApiProductsService.getEventApiProduct({ id: eventApiProductId });
    } catch(e) {
      return undefined;
    }
    // get all versions for selected stateId
    const eventApiProductVersionList: Array<EventApiProductVersion> = await this.getVersionsForEventApiProductId({
      eventApiProductId: eventApiProductId,
      stateId: stateId,
    });
    let eventApiProductVersion: EventApiProductVersion | undefined = undefined;
    if(versionString === undefined) {
      // extract the latest version
      eventApiProductVersion = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventApiProductVersionList });
    } else {
      // extract the version
      eventApiProductVersion = this.getEpObjectVersionFromList({ 
        epObjectVersionList: eventApiProductVersionList,
        versionString: versionString,
      });
    }
    if(eventApiProductVersion === undefined) return undefined;
    // create a list of all versions
    const versionStringList: Array<string> = eventApiProductVersionList.map( (eventApiProductVersion: EventApiProductVersion) => {
      /* istanbul ignore next */
      if(eventApiProductVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiProductVersion.version === undefined', {
        eventApiProductVersion: eventApiProductVersion
      });
      return eventApiProductVersion.version;
    });
    /* istanbul ignore next */
    if(eventApiProductResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiProductResponse.data === undefined', {
      eventApiProductResponse: eventApiProductResponse
    });
    return {
      eventApiProduct: eventApiProductResponse.data as EpSdkEventApiProduct,
      eventApiProductVersion: eventApiProductVersion as EpSdkEventApiProductVersion,
      meta: {
        versionStringList: versionStringList
      }
    }
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

