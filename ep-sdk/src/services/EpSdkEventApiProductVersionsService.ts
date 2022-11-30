import {
  EventApiProductsResponse,
  EventApiProduct,
  EventApiProductsService,
  EventApiProductVersionsResponse,
  EventApiProductVersion,
  Pagination,
  EventApiProductResponse,
} from '@solace-labs/ep-openapi-node';
import { EpSdkApiContentError, EpSdkServiceError } from "../utils";
import { EpApiHelpers } from "../internal-utils";
import { 
  TEpSdkSortDirection,
  EpSdkBrokerTypes, 
  EpSdkPagination, 
  EpSdkSortInfo, 
  IEpSdkAttributesQuery 
} from "../types";
import { EpSdkVersionService } from "./EpSdkVersionService";
import EpSdkEventApiProductsService from './EpSdkEventApiProductsService';


export type EpSdkEventApiProduct = Required<Pick<EventApiProduct, "applicationDomainId" | "id" | "name">> & Omit<EventApiProduct, "applicationDomainId" | "id" | "name">;
export type EpSdkEventApiProductVersion = Required<Pick<EventApiProductVersion, "id" | "eventApiProductId" | "version" | "stateId" | "plans" | "solaceMessagingServices">> & Omit<EventApiProductVersion, "id" | "eventApiProductId" | "version" | "stateId" | "plans" | "solaceMessagingServices">;

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
export interface EpSdkEventApiProductAndVersionSortInfo {
  eventApiProduct?: EpSdkSortInfo;
  eventApiProductVersion?: EpSdkSortInfo; 
}
export class EpSdkEventApiProductVersionsService extends EpSdkVersionService {

  private getLatestVersionForEventApiProductId = async ({ 
    eventApiProductId, 
    stateId,
    withAtLeastOnePlan = false,
    withAtLeastOneAMessagingService = false,
  }: {
    eventApiProductId: string;
    stateId?: string;
    withAtLeastOnePlan?: boolean;
    withAtLeastOneAMessagingService?: boolean;
  }): Promise<EventApiProductVersion | undefined> => {
    // const funcName = 'getLatestVersionObjectForEventApiProductId';
    // const logName = `${EpSdkEventApiProductVersionsService.name}.${funcName}()`;

    // get all versions for selected stateId & filters
    const eventApiProductVersionList: Array<EventApiProductVersion> = await this.getVersionsForEventApiProductId({
      eventApiProductId: eventApiProductId,
      stateId: stateId,
      withAtLeastOnePlan: withAtLeastOnePlan,
      withAtLeastOneAMessagingService: withAtLeastOneAMessagingService
    });
    // extract the latest version
    const latest_EventApiProductVersion: EventApiProductVersion | undefined = this.getLatestEpObjectVersionFromList({ epObjectVersionList: eventApiProductVersionList });
    return latest_EventApiProductVersion;
  }


  /**
   * Returns sorted list. 
   * @param param0 
   */
  protected sortEpSdkEventApiProductAndVersionList({ epSdkEventApiProductAndVersionList, sortInfo }:{
    epSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList;
    sortInfo: EpSdkEventApiProductAndVersionSortInfo;
  }): EpSdkEventApiProductAndVersionList {
    const getValueByFieldName = (obj: any, fieldName: any): string => {
      const funcName = 'getValueByFieldName';
      const logName = `${EpSdkEventApiProductVersionsService.name}.${funcName}()`;
      if(fieldName in obj) return obj[fieldName];
      throw new EpSdkServiceError(logName, this.constructor.name, "unknown or undefined field name", { 
        fieldName: fieldName,
        obj: obj
      });
    }
  
    if(sortInfo.eventApiProduct) {
      return epSdkEventApiProductAndVersionList.sort( (one: EpSdkEventApiProductAndVersion, two: EpSdkEventApiProductAndVersion) => {
        const _oneSortValue: string = getValueByFieldName(one.eventApiProduct, sortInfo.eventApiProduct?.sortFieldName).toLowerCase();
        const _twoSortValue: string = getValueByFieldName(two.eventApiProduct, sortInfo.eventApiProduct?.sortFieldName).toLowerCase();
        switch(sortInfo.eventApiProduct?.sortDirection) {
          case "desc":
            return _oneSortValue.localeCompare(_twoSortValue);
          case "asc":
          default:
            return _twoSortValue.localeCompare(_oneSortValue);
        }
      });
    } else if(sortInfo.eventApiProductVersion) {
      return epSdkEventApiProductAndVersionList.sort( (one: EpSdkEventApiProductAndVersion, two: EpSdkEventApiProductAndVersion) => {
        const _oneSortValue: string = getValueByFieldName(one.eventApiProductVersion, sortInfo.eventApiProductVersion?.sortFieldName).toLowerCase();
        const _twoSortValue: string = getValueByFieldName(two.eventApiProductVersion, sortInfo.eventApiProductVersion?.sortFieldName).toLowerCase();
        switch(sortInfo.eventApiProduct?.sortDirection) {
          case "desc":
            return _oneSortValue.localeCompare(_twoSortValue);
          case "asc":
          default:
            return _twoSortValue.localeCompare(_oneSortValue);
        }
      });
    }
    // unsorted
    return epSdkEventApiProductAndVersionList;
  }

  public listAllLatestVersions = async({ 
    applicationDomainIds, 
    shared, 
    brokerType, 
    stateId, 
    objectAttributesQuery,
    withAtLeastOnePlan = false,
    withAtLeastOneAMessagingService = false,
  }:{
    applicationDomainIds?: Array<string>;
    shared: boolean;
    brokerType?: EpSdkBrokerTypes;
    stateId?: string;
    objectAttributesQuery?: IEpSdkAttributesQuery;
    withAtLeastOnePlan?: boolean;
    withAtLeastOneAMessagingService?: boolean;
  }): Promise<EpSdkEventApiProductAndVersionList> => {
    const funcName = 'listAllLatestVersions';
    const logName = `${EpSdkEventApiProductVersionsService.name}.${funcName}()`;

    // get all api products:
    // - we may have eventApiProducts without a version in the state requested
    const eventApiProductsResponse: EventApiProductsResponse = await EpSdkEventApiProductsService.listAll({
      applicationDomainIds: applicationDomainIds,
      shared: shared,
      brokerType: brokerType,
      attributesQuery: objectAttributesQuery,
    });
    const eventApiProductList: Array<EventApiProduct> = eventApiProductsResponse.data ? eventApiProductsResponse.data : [];

    // create the complete list
    const complete_EpSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = [];
    for(const eventApiProduct of eventApiProductList) {
      /* istanbul ignore next */
      if(eventApiProduct.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiProduct.id === undefined', {
        eventApiProduct: eventApiProduct
      });
      // get the latest version in the requested state & by filters
      const latest_EventApiProductVersion: EventApiProductVersion | undefined = await this.getLatestVersionForEventApiProductId({
        eventApiProductId: eventApiProduct.id,
        stateId: stateId,
        withAtLeastOnePlan: withAtLeastOnePlan,
        withAtLeastOneAMessagingService: withAtLeastOneAMessagingService
      });      
      if(latest_EventApiProductVersion !== undefined) complete_EpSdkEventApiProductAndVersionList.push({
        eventApiProduct: eventApiProduct as EpSdkEventApiProduct,
        eventApiProductVersion: latest_EventApiProductVersion as EpSdkEventApiProductVersion
      });
    }
    return complete_EpSdkEventApiProductAndVersionList;
  }

  public listLatestVersions = async({ 
    applicationDomainIds, 
    shared, 
    brokerType, 
    stateId, 
    pageNumber = 1, 
    pageSize = 20, 
    sortInfo,
    objectAttributesQuery,
    withAtLeastOnePlan = false,
    withAtLeastOneAMessagingService = false,
  }:{
    applicationDomainIds?: Array<string>;
    shared: boolean;
    brokerType?: EpSdkBrokerTypes;
    stateId?: string;
    pageNumber?: number;
    pageSize?: number;
    sortInfo?: EpSdkEventApiProductAndVersionSortInfo;
    objectAttributesQuery?: IEpSdkAttributesQuery;
    withAtLeastOnePlan?: boolean;
    withAtLeastOneAMessagingService?: boolean;
  }): Promise<EpSdkEventApiProductAndVersionListResponse> => {
    const funcName = 'listLatestVersions';
    const logName = `${EpSdkEventApiProductVersionsService.name}.${funcName}()`;
    // get complete list
    const complete_EpSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = await this.listAllLatestVersions({
      applicationDomainIds: applicationDomainIds,
      shared: shared, 
      brokerType: brokerType, 
      stateId: stateId, 
      objectAttributesQuery: objectAttributesQuery,
      withAtLeastOnePlan: withAtLeastOnePlan,
      withAtLeastOneAMessagingService: withAtLeastOneAMessagingService,
    });
    // sort
    let sorted_EpSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = complete_EpSdkEventApiProductAndVersionList;
    if(sortInfo) sorted_EpSdkEventApiProductAndVersionList = this.sortEpSdkEventApiProductAndVersionList({
      epSdkEventApiProductAndVersionList: complete_EpSdkEventApiProductAndVersionList,
      sortInfo: sortInfo
    });
    // extract the page
    const startIdx = (pageSize * (pageNumber-1));
    const endIdx = (startIdx + pageSize);
    const epSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = sorted_EpSdkEventApiProductAndVersionList.slice(startIdx, endIdx);
    const nextPage: number | undefined = endIdx < sorted_EpSdkEventApiProductAndVersionList.length ? (pageNumber + 1) : undefined;

    return {
      data: epSdkEventApiProductAndVersionList,
      meta: {
        pagination: {
          count: sorted_EpSdkEventApiProductAndVersionList.length,
          pageNumber: pageNumber,
          nextPage: nextPage
        }
      } 
    };
  }

  public getVersionsForEventApiProductId = async ({ eventApiProductId, stateId, withAtLeastOnePlan = false, withAtLeastOneAMessagingService = false, pageSize = EpApiHelpers.MaxPageSize }: {
    eventApiProductId: string;
    stateId?: string;
    withAtLeastOnePlan?: boolean;
    withAtLeastOneAMessagingService?: boolean;
    pageSize?: number; /** for testing */
  }): Promise<Array<EventApiProductVersion>> => {
    const funcName = 'getVersionsForEventApiProductId';
    const logName = `${EpSdkEventApiProductVersionsService.name}.${funcName}()`;

    const eventApiProductVersionList: Array<EventApiProductVersion> = [];
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {

      const eventApiProductVersionsResponse: EventApiProductVersionsResponse = await EventApiProductsService.getEventApiProductVersions({
        eventApiProductIds: [eventApiProductId],
        pageNumber: nextPage,
        pageSize: pageSize,
        stateId: stateId
      });
      if(eventApiProductVersionsResponse.data === undefined || eventApiProductVersionsResponse.data.length === 0) nextPage = null;
      else {
        let listToAdd: Array<EventApiProductVersion> = eventApiProductVersionsResponse.data;
        // apply filters
        if(withAtLeastOnePlan || withAtLeastOneAMessagingService) {
          listToAdd = eventApiProductVersionsResponse.data.filter( (eventApiProductVersion: EventApiProductVersion) => {
            if(withAtLeastOnePlan) {
              if(eventApiProductVersion.plans === undefined || eventApiProductVersion.plans.length === 0) return false;
            }
            if(withAtLeastOneAMessagingService) {
              if(eventApiProductVersion.solaceMessagingServices === undefined || eventApiProductVersion.solaceMessagingServices.length === 0) return false;
            }
            return true;
          });  
        }
        eventApiProductVersionList.push(...listToAdd);
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

  /**
   * Retrieves Event API Product & Version object in the given stateId & filters.
   * If versionString is omitted, retrieves the latest version.
   */
  public getObjectAndVersionForEventApiProductId = async ({ eventApiProductId, stateId, versionString, withAtLeastOnePlan = false, withAtLeastOneAMessagingService = false }: {
    eventApiProductId: string;
    stateId?: string;
    versionString?: string;
    withAtLeastOnePlan?: boolean;
    withAtLeastOneAMessagingService?: boolean;
  }): Promise<EpSdkEventApiProductAndVersionResponse | undefined> => {
    const funcName = 'getObjectAndVersionForEventApiProductId';
    const logName = `${EpSdkEventApiProductVersionsService.name}.${funcName}()`;

    // get event api product
    let eventApiProductResponse: EventApiProductResponse;
    try {
      eventApiProductResponse = await EventApiProductsService.getEventApiProduct({ id: eventApiProductId });
    } catch(e) {
      return undefined;
    }
    /* istanbul ignore next */
    if(eventApiProductResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiProductResponse.data === undefined', {
      eventApiProductResponse: eventApiProductResponse
    });
    
    // get all versions for selected stateId with plans & messaging services
    const eventApiProductVersionList: Array<EventApiProductVersion> = await this.getVersionsForEventApiProductId({
      eventApiProductId: eventApiProductId,
      stateId: stateId,
      withAtLeastOnePlan: withAtLeastOnePlan,
      withAtLeastOneAMessagingService: withAtLeastOneAMessagingService,
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
    return {
      eventApiProduct: eventApiProductResponse.data as EpSdkEventApiProduct,
      eventApiProductVersion: eventApiProductVersion as EpSdkEventApiProductVersion,
      meta: {
        versionStringList: versionStringList
      }
    }
  }
}

export default new EpSdkEventApiProductVersionsService();

