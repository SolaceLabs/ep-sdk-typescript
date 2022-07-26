
import * as sinon from 'sinon';

import { ApiRequestOptions } from "../../src/sep-openapi-node/core/ApiRequestOptions";
import { CancelablePromise, OpenAPIConfig } from "../../src/sep-openapi-node";
import { ApiResult } from "../../src/sep-openapi-node/core/ApiResult";
import * as __requestLib from '../../src/sep-openapi-node/core/request';
import { TestContext } from "./TestContext";
import { TestLogger } from "./TestLogger";
import { customRequest } from "./customOpenApiRequest";


// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Stubbing global request from openapi
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// export const request = <T>(config: OpenAPIConfig, options: ApiRequestOptions): CancelablePromise<T> => {
  const stub = sinon.stub(__requestLib, 'request');
  stub.callsFake((config: OpenAPIConfig, options: ApiRequestOptions): CancelablePromise<ApiResult> => {
  
      TestContext.setApiRequestOptions(options);
      TestLogger.logApiRequestOptions(TestContext.getItId(), options);
  
      TestContext.setApiResult(undefined);
      TestContext.setApiError(undefined);

      // const cancelablePromise = stub.wrappedMethod(config, options) as CancelablePromise<ApiResult>;
      // call my own request
      
      const cancelablePromise = customRequest(config, options) as CancelablePromise<ApiResult>;


      cancelablePromise.then((value: ApiResult) => {
          TestContext.setApiResult(value);
          TestLogger.logApiResult(TestContext.getItId(), TestContext.getApiResult());
      }, (reason) => {
          TestContext.setApiError(reason);
          TestLogger.logApiError(TestContext.getItId(), TestContext.getApiError());
      });
  
      return cancelablePromise;
  });
  