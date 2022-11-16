import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';
import { TestUtils } from '../../lib/TestUtils';
import { 
  ApiError, 
  ApplicationDomainResponse, 
  ApplicationDomainsService, 
  EventApiProductsService,
  EventApiProductResponse,
  EventApiProduct,
  Plan,
  SolaceClassOfServicePolicy,
  MessagingServicesService,
  MessagingServicesResponse,
  MessagingService,
  EventApiProductVersionResponse,
  EventApiProductsResponse,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkError,
  EpSdkEventApiProductsService,
  EpSdkEventApiProductVersionsService,
  EpSdkEventApiProductAndVersionList,
  EpSdkEventApiProductAndVersionListResponse,
  TEpSdkCustomAttributeList,
  TEpSdkCustomAttribute,
  IEpSdkAttributesQuery,
  EEpSdkComparisonOps,
  EpSdkApplicationDomainsService,
  EpSdkBrokerTypes,
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();

const PublishDestinationsAttribute: TEpSdkCustomAttribute = {
  name: "PUBLISH_DESTINATIONS",
  value: "ep-developer-portal"
};

const EmptyPublishDestinationAttributesQuery: IEpSdkAttributesQuery = {
  AND: {
    queryList: [
      {
        attributeName: PublishDestinationsAttribute.name,
        comparisonOp: EEpSdkComparisonOps.IS_EMPTY,
        value: '',
      },
    ]  
  }
};

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    before(async() => {
    });
  
    after(async() => {
    });

    it(`${scriptName}: should set PublishDestinationsAttribute on all Event Api Products without it`, async () => {
      try {
        // get all Event Api Products without PublishDestinationsAttribute
        // TODO: need to page
        const eventApiProductsResponse: EventApiProductsResponse = await EpSdkEventApiProductsService.listAll({
          shared: true,
          attributesQuery: EmptyPublishDestinationAttributesQuery
        });
        expect(eventApiProductsResponse.data).to.not.be.undefined;
        for(const eventApiProduct of eventApiProductsResponse.data) {

        }

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    // it(`${scriptName}: should set correct publish destination attribute on even event api products`, async () => {
    //   try {
    //     const setList = [];
    //     for(let i=0; i < NumEventApiProducts; i++) {
    //       if(i % 2 === 0) {
    //         const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
    //           eventApiProductId: EventApiProductIdList[i],
    //           epSdkCustomAttributeList: [CorrectPublishDestinationAttribute],
    //         });
    //         setList.push(eventApiProduct);            
    //       }
    //     }
    //     // // DEBUG
    //     // expect(false, `setList=${JSON.stringify(setList, null, 2)}`).to.be.true;
    //   } catch(e) {
    //     if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
    //     expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    //     expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    //   }
    // });


});

