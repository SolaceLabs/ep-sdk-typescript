import { EEpSdkLogLevel, EpSdkLogger } from "../../src/EpSdkLogger";

enum EEnvVars {
  EP_SDK_TEST_SOLACE_CLOUD_TOKEN = 'EP_SDK_TEST_SOLACE_CLOUD_TOKEN',
  EP_SDK_TEST_EP_API_BASE_URL = "EP_SDK_TEST_EP_API_BASE_URL",
  EP_SDK_TEST_LOG_LEVEL = "EP_SDK_TEST_LOG_LEVEL"
};

export type TTestConfig = {
  epBaseUrl: string;
  logLevel: EEpSdkLogLevel;
};

class TestConfig {

  private appId: string = "ep-sdk-test";
  private solaceCloudToken: string;
  private testConfig: TTestConfig;

  private DEFAULT_EP_SDK_TEST_EP_API_BASE_URL = "https://api.solace.cloud";

  private getMandatoryEnvVarValueAsString = (envVarName: string): string => {
    const value: string | undefined = process.env[envVarName];
    if (!value) throw new Error(`mandatory env var missing: ${envVarName}`);    
    return value;
  };

  private getOptionalEnvVarValueAsUrlWithDefault = (envVarName: string, defaultValue: string): string => {
    const value: string | undefined = process.env[envVarName];
    if(!value) return defaultValue;
    // check if value is a valid Url
    const valueUrl: URL = new URL(value);
    return value;
  }

  private getMandatoryEnvVarValueAsNumber = (envVarName: string): number => {
    const value: string = this.getMandatoryEnvVarValueAsString(envVarName);
    const valueAsNumber: number = parseInt(value);
    if (Number.isNaN(valueAsNumber)) throw new Error(`env var type is not a number: ${envVarName}=${value}`);
    return valueAsNumber;
  };


  public initialize = (): void => {
    // handle solace cloud token separately
    this.solaceCloudToken = this.getMandatoryEnvVarValueAsString(EEnvVars.EP_SDK_TEST_SOLACE_CLOUD_TOKEN);

    this.testConfig = {
      epBaseUrl: this.getOptionalEnvVarValueAsUrlWithDefault(EEnvVars.EP_SDK_TEST_EP_API_BASE_URL, this.DEFAULT_EP_SDK_TEST_EP_API_BASE_URL),
      logLevel: this.getMandatoryEnvVarValueAsNumber(EEnvVars.EP_SDK_TEST_LOG_LEVEL)
    };

  }

  public getAppId = (): string => { 
    return this.appId; 
  }
  public getSolaceCloudToken = (): string => {
    return this.solaceCloudToken;
  }
  public getConfig = (): TTestConfig => {
    return this.testConfig;
  };

}

export default new TestConfig();