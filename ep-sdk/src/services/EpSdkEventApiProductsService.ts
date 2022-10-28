import { EpSdkApiContentError } from '../utils/EpSdkErrors';
import { 
  EventApiProduct,
  EventApiProductsResponse,
  EventApiProductsService,
  Pagination, 
} from '@solace-labs/ep-openapi-node';
import { EpSdkBrokerType, EpSdkService } from './EpSdkService';

export class EpSdkEventApiProductsService extends EpSdkService {

  /**
   * Retrieves a list of all EventApiProducts without paging.
   * @param param0 
   */
  public listAll = async({ applicationDomainIds, shared, brokerType, sortFieldName }:{
    applicationDomainIds?: Array<string>;
    shared: boolean;
    brokerType?: EpSdkBrokerType;
    sortFieldName?: string;
  }): Promise<EventApiProductsResponse> => {
    const funcName = 'listAll';
    const logName = `${EpSdkEventApiProductsService.name}.${funcName}()`;

    const eventApiProductList: Array<EventApiProduct> = [];
    
    let nextPage: number | undefined | null = 1;
    while(nextPage !== undefined && nextPage !== null) {
      const eventApiProductsResponse: EventApiProductsResponse = await EventApiProductsService.getEventApiProducts({
        pageSize: 100,
        pageNumber: nextPage,
        sort: sortFieldName,
        applicationDomainIds: applicationDomainIds,
        shared: shared,
        brokerType: brokerType
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
    const eventApiProductsResponse: EventApiProductsResponse = {
      data: eventApiProductList,
      meta: {
        pagination: {
          count: eventApiProductList.length,
        }
      }
    };
    return  eventApiProductsResponse;
  }

}

export default new EpSdkEventApiProductsService();
