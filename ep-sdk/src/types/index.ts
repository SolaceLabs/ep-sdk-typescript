
export enum EpSdkBrokerTypes {
  Solace = "solace",
  Kafka = "kafka"
}

export enum EEpSdkCustomAttributeEntityTypes {
  APPLICATION_DOMAIN = "applicationDomain",
  ENUM = "enum",
  ENUM_VERSION = "enumVersion",
  APPLICATION = "application",
  APPLICATION_VERSION = "applicationVersion",
  SCHEMA_OBJECT = "schema",
  SCHEMA_VERSION = "schemaVersion",
  EVENT = "event",
  EVENT_VERSION = "eventVersion",
  EVENT_API = "eventApi",
  EVENT_API_VERSION = "eventApiVersion",
  EVENT_API_PRODUCT = "eventApiProduct",
  EVENT_API_PRODUCT_VERSION = "eventApiProductVersion",
  // consumer?, 
}

export enum EEpSdkObjectTypes {
  CUSTOM_ATTRIBUTE_DEFINITION = "customAttributeDefinition",
  APPLICATION_DOMAIN = "applicationDomain",
  ENUM = "enum",
  ENUM_VERSION = "enumVersion",
  APPLICATION = "application",
  APPLICATION_VERSION = "applicationVersion",
  SCHEMA_OBJECT = "schema",
  SCHEMA_VERSION = "schemaVersion",
  EVENT = "event",
  EVENT_VERSION = "eventVersion",
  EVENT_API = "eventApi",
  EVENT_API_VERSION = "eventApiVersion",
  EVENT_API_PRODUCT = "eventApiProduct",
  EVENT_API_PRODUCT_VERSION = "eventApiProductVersion",
}

export type EpSdkPagination = {
  count: number;
  pageNumber: number;
  nextPage?: number;
}

export type TEpSdkCustomAttribute = {
  name: string;
  value: string;
}

export type TEpSdkCustomAttributeList = Array<TEpSdkCustomAttribute>;

// poor mans query interface
export enum EEpSdkComparisonOps {
  IS_EQUAL = "IS_EQUAL",
  CONTAINS = "CONTAINS",
  IS_EMPTY = "IS_EMPTY"
}
export interface IEpSdkAttributeQuery {
  attributeName: string;
  comparisonOp: EEpSdkComparisonOps;
  value: string;
}
export interface IEpSdkAndAttributeQuery {
  queryList: Array<IEpSdkAttributeQuery>;
  OR?: IEpSdkOrAttributeQuery;
}
export interface IEpSdkOrAttributeQuery {
  queryList: Array<IEpSdkAttributeQuery>;
}
/**
 * Attributes Query Definition.
 * @example
 * Example:
 * ```
 * const ExampleQuery: IEpSdkAttributesQuery = {
 * AND: {
 *  queryList: [
 *   {
 *     attributeName: 'PUBLISH_DESTINATION',
 *     comparisonOp: EEpSdkComparisonOps.IS_EQUAL,
 *     value: 'DEV-PORTAL-SYSTEM-ID',
 *   },
 *  ],
 *  OR: {
 *     queryList: [
 *       {
 *        attributeName: 'OWNING_DOMAIN_ID',
 *         comparisonOp: EEpSdkComparisonOps.IS_EQUAL,
 *         value: 'DOMAIN-ID'
 *       },
 *       {
 *         attributeName: 'DOMAIN_ID_SHARING',
 *         comparisonOp: EEpSdkComparisonOps.CONTAINS,
 *         value: 'SHARED-WITH-DOMAIN-ID'
 *       },      
 *     ]
 *    }
 *  }
 * };
 * ```
 */
export interface IEpSdkAttributesQuery {
  AND: IEpSdkAndAttributeQuery;
}