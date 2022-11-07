import { EpSdkApiContentError } from '../utils/EpSdkErrors';
import {
  CustomAttributeDefinition,
  CustomAttributeDefinitionResponse,
  CustomAttributeDefinitionsResponse,
  CustomAttributeDefinitionsService,
  Pagination,
} from '@solace-labs/ep-openapi-node';
import { EpSdkService } from './EpSdkService';
import { EpApiHelpers } from '../internal-utils/EpApiHelpers';
import { EpSdkLogger } from '../utils/EpSdkLogger';
import { EEpSdkLoggerCodes } from '../utils/EpSdkLoggerCodes';

export class EpSdkCustomAttributeDefinitionsService extends EpSdkService {

  /**
   * Get attribute definition by name. Name is unique.
   */
  public getByName = async ({ attributeName, pageSize = EpApiHelpers.MaxPageSize }: {
    attributeName: string;
    pageSize?: number; /** for testing */
  }): Promise<CustomAttributeDefinition | undefined> => {
    const funcName = 'getByName';
    const logName = `${EpSdkCustomAttributeDefinitionsService.name}.${funcName}()`;

    let customAttributeDefinitionList: Array<CustomAttributeDefinition> = [];
    let nextPage: number | undefined | null = 1;

    while(nextPage !== null) {
      const customAttributeDefinitionsResponse: CustomAttributeDefinitionsResponse = await CustomAttributeDefinitionsService.getCustomAttributeDefinitions({
        pageSize: pageSize,
        pageNumber: nextPage,
      });
      if(customAttributeDefinitionsResponse.data === undefined || customAttributeDefinitionsResponse.data.length === 0) nextPage = null;
      else {
        const filteredList = customAttributeDefinitionsResponse.data.filter( (customAttributeDefinition: CustomAttributeDefinition) => {
          /* istanbul ignore next */
          if(customAttributeDefinition.name === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'customAttributeDefinition.name === undefined', {
            customAttributeDefinition: customAttributeDefinition
          });
          let doInclude = false;
          // return immediately if found
          if(customAttributeDefinition.name === attributeName) return customAttributeDefinition;
          // filter for name          
          if(customAttributeDefinition.name === attributeName) doInclude = true;          
          return doInclude;
        });
        customAttributeDefinitionList.push(...filteredList);
      }
      /* istanbul ignore next */
      if(customAttributeDefinitionsResponse.meta === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'customAttributeDefinitionsResponse.meta === undefined', {
        customAttributeDefinitionsResponse: customAttributeDefinitionsResponse
      });
      /* istanbul ignore next */
      if(customAttributeDefinitionsResponse.meta.pagination === undefined) throw new EpSdkApiContentError(logName, this.constructor.name,'customAttributeDefinitionsResponse.meta.pagination === undefined', {
        customAttributeDefinitionsResponse: customAttributeDefinitionsResponse
      });
      const pagination: Pagination = customAttributeDefinitionsResponse.meta.pagination;
      nextPage = pagination.nextPage;
    }
    if(customAttributeDefinitionList.length === 0) return undefined;
    if(customAttributeDefinitionList.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name,'customAttributeDefinitionList.length > 1', {
      customAttributeDefinitionList: customAttributeDefinitionList
    });
    return customAttributeDefinitionList[0];
  }

  public getById = async ({ customAttributeDefinitionId }: {
    customAttributeDefinitionId: string;
  }): Promise<CustomAttributeDefinition> => {
    const funcName = 'getById';
    const logName = `${EpSdkCustomAttributeDefinitionsService.name}.${funcName}()`;

    const customAttributeDefinitionResponse: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.getCustomAttributeDefinition({
      id: customAttributeDefinitionId,
    })
    EpSdkLogger.trace(EpSdkLogger.createLogEntry(logName, {
      code: EEpSdkLoggerCodes.SERVICE_GET, module: this.constructor.name, details: {
        customAttributeDefinitionResponse: customAttributeDefinitionResponse
      }
    }));

    /* istanbul ignore next */
    if (customAttributeDefinitionResponse.data === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, "customAttributeDefinitionResponse.data === undefined", {
      customAttributeDefinitionId: customAttributeDefinitionId
    });
    const customAttributeDefinition: CustomAttributeDefinition = customAttributeDefinitionResponse.data;
    return customAttributeDefinition;
  }

  public deleteById = async ({ customAttributeDefinitionId }: {
    customAttributeDefinitionId: string;
  }): Promise<CustomAttributeDefinition> => {
    const funcName = 'deleteById';
    const logName = `${EpSdkCustomAttributeDefinitionsService.name}.${funcName}()`;

    const customAttributeDefinition: CustomAttributeDefinition = await this.getById({
      customAttributeDefinitionId: customAttributeDefinitionId,
    });

    const xvoid: void = await CustomAttributeDefinitionsService.deleteCustomAttributeDefinition({
      id: customAttributeDefinitionId,
    });

    return customAttributeDefinition;
  }


}

export default new EpSdkCustomAttributeDefinitionsService();

