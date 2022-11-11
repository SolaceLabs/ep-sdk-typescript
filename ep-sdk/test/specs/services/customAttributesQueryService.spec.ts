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
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/${scriptName}/${TestSpecId}`;
let ApplicationDomainId: string | undefined;

const NumEventApiProducts = 10; // must be divisible by 2
const getEventApiProductNameList = (): Array<string> => {
  const list: Array<string> = [];;
  for(let i=0; i < NumEventApiProducts; i++) {
    // list.push(`${TestConfig.getAppId()}/${scriptName}/${TestSpecId}/${i}`);
    list.push(i.toString());
  }
  return list;
}
let EventApiProductIdList: Array<string> = [];

const CorrectPublishDestinationAttribute: TEpSdkCustomAttribute = {
  name: "PUBLISH_DESTINATION",
  value: "ep-developer-portal"
};
const UnknownPublishDestinationAttribute: TEpSdkCustomAttribute = {
  name: "PUBLISH_DESTINATION",
  value: "another-system"
};

const AdditionalCustomAttributeList: TEpSdkCustomAttributeList = [
  {
    name: "eventApiProduct_1",
    value: "eventApiProduct_1 value"
  },
  {
    name: "eventApiProduct_2",
    value: "eventApiProduct_2 value"
  }
];

const PublishDestinationAttributesQuery: IEpSdkAttributesQuery = {
  AND: [
    {
      attributeName: CorrectPublishDestinationAttribute.name,
      comparisonOp: EEpSdkComparisonOps.IS_EQUAL,
      value: CorrectPublishDestinationAttribute.value,
    },
    {
      attributeName: CorrectPublishDestinationAttribute.name,
      comparisonOp: EEpSdkComparisonOps.CONTAINS,
      value: CorrectPublishDestinationAttribute.value,
    },
  ]
};

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    before(async() => {
      const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
        requestBody: {
          name: ApplicationDomainName,
        }
      });
      ApplicationDomainId = applicationDomainResponse.data.id;
  });
  
    after(async() => {
      // delete application domain
      await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
      // remove all attribute definitions
      const allAttributes = AdditionalCustomAttributeList.concat([CorrectPublishDestinationAttribute, UnknownPublishDestinationAttribute]);
      const xvoid: void = await EpSdkEventApiProductsService.removeAssociatedEntityTypeFromCustomAttributeDefinitions({
        customAttributeNames: allAttributes.map( (x) => {
          return x.name;
        })
      });      
    });

    it(`${scriptName}: should create all eventApiProducts with  1 version`, async () => {
      try {
        // create the products
        const eventApiProductNameList = getEventApiProductNameList();
        for(const eventApiProductName of eventApiProductNameList) {
          const eventApiProductResponse: EventApiProductResponse = await EventApiProductsService.createEventApiProduct({
            requestBody: {
              applicationDomainId: ApplicationDomainId,
              name: eventApiProductName,
              shared: true,
              brokerType: EventApiProduct.brokerType.SOLACE,
            }
          });
          EventApiProductIdList.push(eventApiProductResponse.data.id);
          // create version 1
          const x = await EventApiProductsService.createEventApiProductVersion({
            requestBody: {
              eventApiProductId: eventApiProductResponse.data.id,
              version: '1.0.0'
            }
          });  
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should set correct publish destination attribute on even event api products`, async () => {
      try {
        const setList = [];
        for(let i=0; i < NumEventApiProducts; i++) {
          if(i % 2 === 0) {
            const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
              eventApiProductId: EventApiProductIdList[i],
              epSdkCustomAttributeList: [CorrectPublishDestinationAttribute],
            });
            setList.push(eventApiProduct);
          }
        }
        // // DEBUG
        // expect(false, `setList=${JSON.stringify(setList, null, 2)}`).to.be.true;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get filtered list of latest event api product versions: 1`, async () => {
      try {
        const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse = await EpSdkEventApiProductVersionsService.listLatestVersions({
          applicationDomainIds: [ApplicationDomainId],
          shared: true,
          pageNumber: 1,
          pageSize: 100,
          objectAttributesQuery: PublishDestinationAttributesQuery
        });
        const epSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = epSdkEventApiProductAndVersionListResponse.data;

        const message = `epSdkEventApiProductAndVersionList=\n${JSON.stringify(epSdkEventApiProductAndVersionList, null, 2)}`;        
        // // DEBUG
        // expect(false, message).to.be.true;        
        expect(epSdkEventApiProductAndVersionList.length, message).to.equal(NumEventApiProducts/2);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should set unknown publish destination on odd eventApiProducts`, async () => {
      try {
        for(let i=0; i < NumEventApiProducts; i++) {
          if(i % 2 === 1) {
            const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
              eventApiProductId: EventApiProductIdList[i],
              epSdkCustomAttributeList: [UnknownPublishDestinationAttribute],
            });
          }
        }
        // // DEBUG
        // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get filtered list of latest event api product versions: 2`, async () => {
      try {
        const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse = await EpSdkEventApiProductVersionsService.listLatestVersions({
          applicationDomainIds: [ApplicationDomainId],
          shared: true,
          pageNumber: 1,
          pageSize: 100,
          objectAttributesQuery: PublishDestinationAttributesQuery
        });
        const epSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = epSdkEventApiProductAndVersionListResponse.data;

        const message = `epSdkEventApiProductAndVersionList=\n${JSON.stringify(epSdkEventApiProductAndVersionList, null, 2)}`;        
        // // DEBUG
        // expect(false, message).to.be.true;        
        expect(epSdkEventApiProductAndVersionList.length, message).to.equal(NumEventApiProducts/2);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should set additional attributes on all eventApiProducts`, async () => {
      try {
        for(let i=0; i < NumEventApiProducts; i++) {
          const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
            eventApiProductId: EventApiProductIdList[i],
            epSdkCustomAttributeList: AdditionalCustomAttributeList,
          });
        }
        // // DEBUG
        // expect(false, `application.customAttributes=${JSON.stringify(application.customAttributes, null, 2)}`).to.be.true;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get filtered list of latest event api product versions: 3`, async () => {
      try {
        const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse = await EpSdkEventApiProductVersionsService.listLatestVersions({
          applicationDomainIds: [ApplicationDomainId],
          shared: true,
          pageNumber: 1,
          pageSize: 100,
          objectAttributesQuery: PublishDestinationAttributesQuery
        });
        const epSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = epSdkEventApiProductAndVersionListResponse.data;

        const message = `epSdkEventApiProductAndVersionList=\n${JSON.stringify(epSdkEventApiProductAndVersionList, null, 2)}`;        
        // // DEBUG
        // expect(false, message).to.be.true;        
        expect(epSdkEventApiProductAndVersionList.length, message).to.equal(NumEventApiProducts/2);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

});

