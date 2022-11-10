import { 
  CustomAttribute,
  EventApiProduct,
  EventApiProductResponse,
  EventApiProductsResponse,
  EventApiProductsService,
  Pagination, 
} from '@solace-labs/ep-openapi-node';
import { EEpSdkLoggerCodes, EpSdkApiContentError, EpSdkLogger } from '../utils';
import { EpSdkService } from './EpSdkService';
import { EEpSdkCustomAttributeEntityTypes, EpSdkBrokerTypes, TEpSdkCustomAttributeList } from '../types';
import EpSdkCustomAttributesService from './EpSdkCustomAttributesService';
import EpSdkCustomAttributeDefinitionsService from './EpSdkCustomAttributeDefinitionsService';

export class EpSdkEventApiProductsService extends EpSdkService {

  private async updateEventApiProduct({ update }:{
    update: EventApiProduct;
  }): Promise<EventApiProduct> {
    const funcName = 'updateEventApiProduct';
    const logName = `${EpSdkEventApiProductsService.name}.${funcName}()`;

    /* istanbul ignore next */
    if(update.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'update.id === undefined', {
      update: update
    });

    const eventApiProductResponse: EventApiProductResponse = await EventApiProductsService.updateEventApiProduct({
      id: update.id,
      requestBody: update
    });
    /* istanbul ignore next */
    if(eventApiProductResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'eventApiProductResponse.data === undefined', {
      eventApiProductResponse: eventApiProductResponse
    });
    return eventApiProductResponse.data;
  }

  /**
   * Sets the custom attributes in the list on the event api product.
   * Creates attribute definitions / adds entity type 'eventApiProduct' if it doesn't exist.
   */
  public async setCustomAttributes({ eventApiProductId, epSdkCustomAttributeList}:{
    eventApiProductId: string;
    epSdkCustomAttributeList: TEpSdkCustomAttributeList;
  }): Promise<EventApiProduct> {
    const eventApiProduct: EventApiProduct = await this.getById({
      eventApiProductId: eventApiProductId,
    });
    const customAttributes: Array<CustomAttribute> = await EpSdkCustomAttributesService.createCustomAttributesWithNew({
      existingCustomAttributes: eventApiProduct.customAttributes,
      epSdkCustomAttributeList: epSdkCustomAttributeList,
      epSdkCustomAttributeEntityType: EEpSdkCustomAttributeEntityTypes.EVENT_API_PRODUCT
    });
    return await this.updateEventApiProduct({
      update: {
        ...eventApiProduct,
        customAttributes: customAttributes,  
      }
    });
  }

  /**
   * Unsets the custom attributes in the list on the event api product.
   * Leaves attibute definitions as-is.
   */
  public async unsetCustomAttributes({ eventApiProductId, epSdkCustomAttributeList }:{
    eventApiProductId: string;
    epSdkCustomAttributeList: TEpSdkCustomAttributeList;
  }): Promise<EventApiProduct> {
    const eventApiProduct: EventApiProduct = await this.getById({
      eventApiProductId: eventApiProductId,
    });
    const customAttributes: Array<CustomAttribute> = await EpSdkCustomAttributesService.createCustomAttributesExcluding({
      existingCustomAttributes: eventApiProduct.customAttributes,
      epSdkCustomAttributeList: epSdkCustomAttributeList,
    });
    return await this.updateEventApiProduct({
      update: {
        ...eventApiProduct,
        customAttributes: customAttributes,  
      }
    });
  }

  public async removeAssociatedEntityTypeFromCustomAttributeDefinitions({ customAttributeNames }: {
    customAttributeNames: Array<string>;
  }): Promise<void> {
    for(const customAttributeName of customAttributeNames) {
      await EpSdkCustomAttributeDefinitionsService.removeAssociatedEntityTypeFromCustomAttributeDefinition({
        attributeName: customAttributeName,
        associatedEntityType: EEpSdkCustomAttributeEntityTypes.EVENT_API_PRODUCT,
      });
    }
  }

  /**
   * Retrieves a list of all EventApiProducts without paging.
   * @param param0 
   */
  public listAll = async({ applicationDomainIds, shared, brokerType, sortFieldName }:{
    applicationDomainIds?: Array<string>;
    shared: boolean;
    brokerType?: EpSdkBrokerTypes;
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

  public getById = async({ eventApiProductId }:{
    eventApiProductId: string;
  }): Promise<EventApiProduct> => {
    const funcName = 'getById';
    const logName = `${EpSdkEventApiProductsService.name}.${funcName}()`;

    const eventApiProductResponse: EventApiProductResponse = await EventApiProductsService.getEventApiProduct({
      id: eventApiProductId
    });

    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, { code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
      eventApiProductResponse: eventApiProductResponse
    }}));

    if(eventApiProductResponse.data === undefined) {
      throw new EpSdkApiContentError(logName, this.constructor.name, "eventApiProductResponse.data === undefined", {
        eventApiProductId: eventApiProductId
      });
    }
    return eventApiProductResponse.data;
  }


}

export default new EpSdkEventApiProductsService();
