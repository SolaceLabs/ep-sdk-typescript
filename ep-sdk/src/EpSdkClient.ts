import {
  OpenAPI,
  OpenAPIConfig 
} from '@solace-labs/ep-openapi-node';

export class EpSdkClient {

  private static DEFAULT_EP_API_BASE_URL = "https://api.solace.cloud";

  public static initialize = ({ globalOpenAPI, token, baseUrl=EpSdkClient.DEFAULT_EP_API_BASE_URL }:{
    globalOpenAPI: OpenAPIConfig;
    token: string;
    baseUrl?: string;
  }): OpenAPIConfig => {
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

    // // DEBUG: 
    // console.log(`>>>>>>>>\n\n${logName}:\n\n>>>>> globalOpenAPI=${JSON.stringify(globalOpenAPI, null, 2)}\n\n<<<<<<<<<<<`);

    return globalOpenAPI;
  }

}


