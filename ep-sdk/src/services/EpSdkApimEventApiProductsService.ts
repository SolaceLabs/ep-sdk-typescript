import _ from 'lodash';
import {
  EventApiProduct,
  EventApiProductsResponse,
  EventapiproductsService,
  Pagination,
} from '@solace-labs/ep-apim-openapi-node';
import { EpSdkApiContentError, EpSdkServiceError } from "../utils";
import { EpApiHelpers } from "../internal-utils";
// import {
//   EpSdkBrokerTypes,
//   EpSdkPagination,
//   EpSdkSortInfo,
//   IEpSdkAttributesQuery
// } from "../types";
// import EpSdkEventApiProductsService from './EpSdkEventApiProductsService';
import { EpSdkApimService } from './EpSdkApimService';
import { EpSdkBrokerTypes } from '../types';


// export type EpSdkEventApiProduct = Required<Pick<EventApiProduct, "applicationDomainId" | "id" | "name">> & Omit<EventApiProduct, "applicationDomainId" | "id" | "name">;
// export type EpSdkEventApiProductVersion = Required<Pick<EventApiProductVersion, "id" | "eventApiProductId" | "version" | "stateId" | "plans" | "solaceMessagingServices">> & Omit<EventApiProductVersion, "id" | "eventApiProductId" | "version" | "stateId" | "plans" | "solaceMessagingServices">;

// export type EpSdkEventApiProductVersionList = Array<EpSdkEventApiProductVersion>;
// export type EpSdkEventApiProductAndVersion = {
//   eventApiProduct: EpSdkEventApiProduct;
//   eventApiProductVersion: EpSdkEventApiProductVersion;
// }
// export type EpSdkEventApiProductAndVersionList = Array<EpSdkEventApiProductAndVersion>;
// export type EpSdkEventApiProductAndVersionListResponse = {
//   data: EpSdkEventApiProductAndVersionList;
//   meta: {
//     pagination: EpSdkPagination;
//   }
// }
// export type EpSdkEventApiProductAndVersionResponse = EpSdkEventApiProductAndVersion & {
//   meta: {
//     versionStringList: Array<string>;
//   }
// }
// export interface EpSdkEventApiProductAndVersionSortInfo {
//   eventApiProduct?: EpSdkSortInfo;
//   eventApiProductVersion?: EpSdkSortInfo;
// }

/**
 * ISSUES:
 * - logged: brokerType: can I get an enum?
 * - logged: state: can I get an enum of strings?
 */


export class EpSdkApimEventApiProductsService extends EpSdkApimService {

  public listAll = async({

  }: {
    applicationDomainIds?: Array<string>;
    shared: boolean;
    brokerType?: EpSdkBrokerTypes;
    versionState?: string;
    publishDestination?: string;
  //   objectAttributesQuery?: IEpSdkAttributesQuery;
  }): Promise<EventApiProductsResponse> => {
    const funcName = 'listAll';
    const logName = `${EpSdkApimEventApiProductsService.name}.${funcName}()`;

    // TODO: construct the RSQL query

    // https://github.com/piotr-oles/rsql#readme

    // brokerType
    // shared=true
    // version.state='Released'
    // attributes:
    // - PUBLISH_DESTINATIONS contains publishDestination


    const query = 'rsql-query';

    const eventApiProductList: Array<EventApiProduct> = [];

    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {

      const eventApiProductsResponse: EventApiProductsResponse = await EventapiproductsService.listEventApiProducts({
        pageSize: 100,
        pageNumber: nextPage,
        query: query
      });
      if(eventApiProductsResponse.data === undefined || eventApiProductsResponse.data.length === 0) nextPage = undefined;
      else {
        eventApiProductList.push(...eventApiProductsResponse.data);
        /* istanbul ignore next */
        if(eventApiProductsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiProductsResponse.meta === undefined', {
          eventApiProductsResponse: eventApiProductsResponse
        });
        /* istanbul ignore next */
        if(eventApiProductsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'eventApiProductsResponse.meta.pagination === undefined', {
          eventApiProductsResponse: eventApiProductsResponse
        });
        const pagination: Pagination = eventApiProductsResponse.meta.pagination;
        nextPage = pagination.nextPage;
      }
    }
    return {
      data: eventApiProductList,
      meta: {
        pagination: {
          count: eventApiProductList.length,
          nextPage: undefined,
        }
      }
    };
  }

  // public listAllLatestVersions = async ({
  //   applicationDomainIds,
  //   shared,
  //   brokerType,
  //   stateId,
  //   objectAttributesQuery,
  //   withAtLeastOnePlan = false,
  //   withAtLeastOneAMessagingService = false,
  // }: {
  //   applicationDomainIds?: Array<string>;
  //   shared: boolean;
  //   brokerType?: EpSdkBrokerTypes;
  //   stateId?: string;
  //   objectAttributesQuery?: IEpSdkAttributesQuery;
  //   withAtLeastOnePlan?: boolean;
  //   withAtLeastOneAMessagingService?: boolean;
  // }): Promise<EpSdkEventApiProductAndVersionList> => {
  //   const funcName = 'listAllLatestVersions';
  //   const logName = `${EpSdkEventApiProductVersionsService.name}.${funcName}()`;

  //   // get all api products:
  //   // - we may have eventApiProducts without a version in the state requested
  //   const eventApiProductsResponse: EventApiProductsResponse = await EpSdkEventApiProductsService.listAll({
  //     applicationDomainIds: applicationDomainIds,
  //     shared: shared,
  //     brokerType: brokerType,
  //     attributesQuery: objectAttributesQuery,
  //   });
  //   const eventApiProductList: Array<EventApiProduct> = eventApiProductsResponse.data ? eventApiProductsResponse.data : [];

  //   // create the complete list
  //   const complete_EpSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = [];
  //   for (const eventApiProduct of eventApiProductList) {
  //     /* istanbul ignore next */
  //     if (eventApiProduct.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiProduct.id === undefined', {
  //       eventApiProduct: eventApiProduct
  //     });
  //     // get the latest version in the requested state & by filters
  //     const latest_EventApiProductVersion: EventApiProductVersion | undefined = await this.getLatestVersionForEventApiProductId({
  //       eventApiProductId: eventApiProduct.id,
  //       stateId: stateId,
  //       withAtLeastOnePlan: withAtLeastOnePlan,
  //       withAtLeastOneAMessagingService: withAtLeastOneAMessagingService
  //     });
  //     if (latest_EventApiProductVersion !== undefined) complete_EpSdkEventApiProductAndVersionList.push({
  //       eventApiProduct: eventApiProduct as EpSdkEventApiProduct,
  //       eventApiProductVersion: latest_EventApiProductVersion as EpSdkEventApiProductVersion
  //     });
  //   }
  //   return complete_EpSdkEventApiProductAndVersionList;
  // }

}

export default new EpSdkApimEventApiProductsService();

