import { 
  CustomAttribute,
} from "@solace-labs/ep-openapi-node";
import { 
  EEpSdkComparisonOps,
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

    for(const andQuery of attributesQuery.AND) {
      const customAttribute: CustomAttribute | undefined = customAttributes.find( (customAttribute: CustomAttribute) => {
        return customAttribute.customAttributeDefinitionName === andQuery.attributeName;
      });
      console.log(`\n\n${logName}: customAttribute = ${JSON.stringify(customAttribute, null, 2)}\n\n`);
      if(customAttribute === undefined) return false;

      if(customAttribute.value) {
        if(!this.compare({
          sourceValue: customAttribute.value,
          compareValue: andQuery.value,
          comparisonOp: andQuery.comparisonOp
        })) return false;

      }
    }
    return true;
  }

}

export default new EpSdkCustomAttributesQueryService();

