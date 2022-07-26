import { 
  OpenAPI, OpenAPIConfig 
} from './sep-openapi-node';


export class EpSdkClient {

  private static DEFAULT_EP_API_BASE_URL = "https://api.solace.cloud";

  public static initialize = ({ token, baseUrl=EpSdkClient.DEFAULT_EP_API_BASE_URL }:{
    token: string;
    baseUrl?: string;
  }): OpenAPIConfig => {

    const base: URL = new URL(baseUrl);
    OpenAPI.BASE = baseUrl;
    OpenAPI.WITH_CREDENTIALS = true;
    OpenAPI.CREDENTIALS = "include";
    OpenAPI.TOKEN = token;

    const _log = {
      ...OpenAPI,
      TOKEN: "***"
    };
    return _log;
  }

}


