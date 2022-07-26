import { 
  OpenAPI, OpenAPIConfig 
} from './sep-openapi-node';


export class EPClient {

  public static initialize = ({ token, baseUrl }:{
    token: string;
    baseUrl: string;
  }): OpenAPIConfig => {
    const funcName = 'initialize';
    const logName = `${EPClient.name}.${funcName}()`;

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


