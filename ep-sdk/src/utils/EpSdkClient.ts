/**
 * @packageDocumentation
 * 
 * Convenience class to initialize EP OpenAPI & APIM OpenApi.
 * 
 */
import {
  OpenAPI,
  OpenAPIConfig
} from '@solace-labs/ep-openapi-node';

import {
  OpenAPI as ApimOpenAPI,
  OpenAPIConfig as ApimOpenAPIConfig
} from '@solace-labs/ep-apim-openapi-node';

// Need to include this once in the project to generate tsdoc links
// in ALL other files correctly.
// import {
//   OpenAPI,
//   OpenAPIConfig
// } from '../@solace-labs/ep-openapi-node';

/**
 * Convenience class to initialize the OpenAPI config for @solace-labs/ep-openapi-node.
 */
export class EpSdkClient {

  public static readonly DEFAULT_EP_API_BASE_URL = "https://api.solace.cloud";

  /**
   * Initialize the EP OpenAPI global constant.
   * 
   * 
   * @param params
   * @returns OpenAPIConfig
   * 
   * @example
   * import { OpenAPI } from "@solace-labs/ep-openapi-node";
   * 
   * EpSdkClient.initialize({
   *  globalOpenAPI: OpenAPI,
   *  token: 'my token'
   * });
   * 
   */
  public static initialize = ({ globalOpenAPI, globalApimOpenAPI, token, baseUrl=EpSdkClient.DEFAULT_EP_API_BASE_URL }:{
    /** The global OpenAPI const object from  @solace-labs/ep-openapi-node. */
    globalOpenAPI: OpenAPIConfig;
    /** The global APIM OpenAPI const object from  @solace-labs/ep-apim-openapi-node. */
    globalApimOpenAPI: OpenAPIConfig;
    /** The Solace Cloud token. */
    token: string;
    /** Base url for the ep api. @defaultValue  {@link EpSdkClient.DEFAULT_EP_API_BASE_URL} */
    baseUrl?: string;
  }): void => {
    const funcName = 'initialize';
    const logName = `${EpSdkClient.name}.${funcName}()`;

    const base: URL = new URL(baseUrl);
    globalOpenAPI.BASE = baseUrl;
    globalOpenAPI.WITH_CREDENTIALS = true;
    globalOpenAPI.CREDENTIALS = "include";
    globalOpenAPI.TOKEN = token;

    // this allows to use ep-sdk as npm link during development as well
    // two instances of ep-openapi-node in this case
    OpenAPI.BASE = baseUrl;
    OpenAPI.WITH_CREDENTIALS = true;
    OpenAPI.CREDENTIALS = "include";
    OpenAPI.TOKEN = token;

    // globalApimOpenAPI.BASE = baseUrl;
    globalApimOpenAPI.WITH_CREDENTIALS = true;
    globalApimOpenAPI.CREDENTIALS = "include";
    globalApimOpenAPI.TOKEN = token;

    // ApimOpenAPI.BASE = baseUrl;
    ApimOpenAPI.WITH_CREDENTIALS = true;
    ApimOpenAPI.CREDENTIALS = "include";
    ApimOpenAPI.TOKEN = token;

    // // DEBUG:
    // console.log(`>>>>>>>>\n\n${logName}:\n\n>>>>> globalOpenAPI=${JSON.stringify(globalOpenAPI, null, 2)}\n\n<<<<<<<<<<<`);
  }

}
