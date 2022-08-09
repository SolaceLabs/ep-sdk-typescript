import { Validator, ValidatorResult, Schema } from 'jsonschema';

// "meta": {
//   "pagination": {
//     "pageNumber": 1,
//     "count": 10,
//     "pageSize": 2147483647,
//     "nextPage": null,
//     "totalPages": 1
//   }
// }
export type T_EpMetaPagination = {
  pageNumber: number;
  count: number;
  pageSize: number;
  nextPage: any;
  totalPages: number;
}
export type T_EpMeta = {
  pagination: T_EpMetaPagination;
}

const EpMetaPaginationSchema: Schema = {
  type: "object",
  properties: {
    pageNumber: {
      type: "number"
    },
    count: {
      type: "number"
    },
    pageSize: {
      type: "number"
    },
    nextPage: {
      type: "any"
    },
    totalPages: {
      type: "number"
    }
  }
}
const EpMetaSchema: Schema = {
  type: "object",
  properties: {
    pagination: EpMetaPaginationSchema
  }
};

export class EpApiHelpers {
  public static MaxPageSize = 100;
  public static validateMeta = (meta: T_EpMeta) => {
    const funcName = 'validateMeta';
    const logName = `${EpApiHelpers.name}.${funcName}()`;
    const v: Validator = new Validator();
    const validateResult: ValidatorResult = v.validate(meta, EpMetaSchema);
    if(!validateResult.valid) throw new Error(`${logName}: validateResult=\n${JSON.stringify(validateResult, null, 2)}`);
  }

}