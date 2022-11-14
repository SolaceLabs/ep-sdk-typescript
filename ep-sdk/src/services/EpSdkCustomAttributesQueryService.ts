import { 
  CustomAttribute,
} from "@solace-labs/ep-openapi-node";
import { 
  EEpSdkComparisonOps,
  IEpSdkAndAttributeQuery,
  IEpSdkAttributesQuery, 
} from "../types";
import { EpSdkUtils } from "../utils";

export class EpSdkCustomAttributesQueryService {

  private compare({ sourceValue, compareValue, comparisonOp }: {
    sourceValue: string;
    compareValue: string;
    comparisonOp: EEpSdkComparisonOps;
  }): boolean {
    const funcName = 'compare';
    const logName = `${EpSdkCustomAttributesQueryService.name}.${funcName}()`;

    switch(comparisonOp) {
      case EEpSdkComparisonOps.IS_EQUAL:
        return sourceValue === compareValue;
      case EEpSdkComparisonOps.CONTAINS:
        return sourceValue.includes(compareValue);
      default:
        /* istanbul ignore next */
        EpSdkUtils.assertNever(logName, comparisonOp);
    }
    // should never get here
    return false;
  }

  public resolve({ customAttributes, attributesQuery }:{
    customAttributes?: Array<CustomAttribute>;
    attributesQuery: IEpSdkAttributesQuery;
  }): boolean {
    const funcName = 'resolve';
    const logName = `${EpSdkCustomAttributesQueryService.name}.${funcName}()`;

    if(customAttributes === undefined || customAttributes.length === 0) return false;

    const andQuery: IEpSdkAndAttributeQuery = attributesQuery.AND;
    for(const queryItem of andQuery.queryList) {
      const customAttribute: CustomAttribute | undefined = customAttributes.find( (customAttribute: CustomAttribute) => {
        return customAttribute.customAttributeDefinitionName === queryItem.attributeName;
      });
      // console.log(`\n\n${logName}: customAttribute = ${JSON.stringify(customAttribute, null, 2)}\n\n`);
      if(customAttribute === undefined) return false;

      if(customAttribute.value) {
        if(!this.compare({
          sourceValue: customAttribute.value,
          compareValue: queryItem.value,
          comparisonOp: queryItem.comparisonOp
        })) return false;

      }
    }
    // all ANDs have passed, check if at least one OR passes
    if(andQuery.OR) {
      for(const queryItem of andQuery.OR.queryList) {
        const customAttribute: CustomAttribute | undefined = customAttributes.find( (customAttribute: CustomAttribute) => {
          return customAttribute.customAttributeDefinitionName === queryItem.attributeName;
        });
        if(customAttribute !== undefined && customAttribute.value !== undefined) {
          if(this.compare({
            sourceValue: customAttribute.value,
            compareValue: queryItem.value,
            comparisonOp: queryItem.comparisonOp
          })) return true; 
        };
      }
      return false;
    }
    return true;
  }

}

export default new EpSdkCustomAttributesQueryService();

