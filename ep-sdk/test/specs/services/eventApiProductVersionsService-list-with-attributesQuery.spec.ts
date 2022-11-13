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
const ApplicationDomainName = `${TestConfig.getAppId()}/${scriptName}/${TestSpecId}`;
let ApplicationDomainId: string | undefined;

const NumEventApiProducts = 16; // divided by 2 = even number, divided by 2 = even number, divide by 2 = even number
const getEventApiProductNameList = (): Array<string> => {
  const list: Array<string> = [];;
  for(let i=0; i < NumEventApiProducts; i++) {
    list.push(i.toString());
  }
  return list;
}
let EventApiProductIdList: Array<string> = [];

const EventApiProductVersionPlan_1: Plan = {
  name: "plan-1",
  solaceClassOfServicePolicy: {
    accessType: SolaceClassOfServicePolicy.accessType.EXCLUSIVE,
    maximumTimeToLive: 1,
    maxMsgSpoolUsage: 1,
    messageDeliveryMode: SolaceClassOfServicePolicy.messageDeliveryMode.GUARANTEED,
    queueType: SolaceClassOfServicePolicy.queueType.COMBINED,
    type: 'solaceClassOfServicePolicy'
  }
};

enum EEpDevPManageAssetApiObjectAttributeNames {
  PUBLISH_DESTINATION = "PUBLISH_DESTINATION",
  _X_EP_DEVP_DOMAIN_OWNING_ID_ = "_X_EP_DEVP_DOMAIN_OWNING_ID_",
  _X_EP_DEVP_DOMAIN_SHARING_LIST_ = "_X_EP_DEVP_DOMAIN_SHARING_LIST_",
}
const CorrectPublishDestination = "CorrectPublishDestination";
const UnknownPublishDestination = "UnknownPublishDestination";
const XEpDevPDomainOwningId = "XEpDevPDomainOwningId";
const XEpDevPDomainSharing_1 = "XEpDevPDomainSharing_1";
const XEpDevPDomainSharing_2 = "XEpDevPDomainSharing_2";

// TODO: EP does not support the chars required for a serialized JSON object
type TEpDevPManagedAssetBusinessGroupSharing = {
  entityId: {
    id: string;
    displayName: string;
  },
  accessType: 'readonly' | 'full-access';
}
const XEpDevPDomainSharingList: Array<TEpDevPManagedAssetBusinessGroupSharing> = [
  {
    entityId: {
      id: 'XEpDevPDomainSharing_Domain_1',
      displayName: 'XEpDevPDomainSharing_Domain_1',
    },
    accessType: 'readonly'
  },
  {
    entityId: {
      id: 'XEpDevPDomainSharing_Domain_2',
      displayName: 'XEpDevPDomainSharing_Domain_2',
    },
    accessType: 'full-access'
  }
];
// const XEpDevPDomainSharingListAttributeValue = JSON.stringify(XEpDevPDomainSharingList);
const XEpDevPDomainSharingListAttributeValue = `${XEpDevPDomainSharing_1}.${XEpDevPDomainSharing_2}`;

const CorrectPublishDestinationAttribute: TEpSdkCustomAttribute = {
  name: EEpDevPManageAssetApiObjectAttributeNames.PUBLISH_DESTINATION,
  value: CorrectPublishDestination
};
const UnknownPublishDestinationAttribute: TEpSdkCustomAttribute = {
  name: EEpDevPManageAssetApiObjectAttributeNames.PUBLISH_DESTINATION,
  value: UnknownPublishDestination
};
const CorrectDomainCustomAttributeList: TEpSdkCustomAttributeList = [
  {
    name: EEpDevPManageAssetApiObjectAttributeNames._X_EP_DEVP_DOMAIN_OWNING_ID_,
    value: XEpDevPDomainOwningId
  },
  {
    name: EEpDevPManageAssetApiObjectAttributeNames._X_EP_DEVP_DOMAIN_SHARING_LIST_,
    value: XEpDevPDomainSharingListAttributeValue
  }
];
const UnknownDomainCustomAttributeList: TEpSdkCustomAttributeList = [
  {
    name: EEpDevPManageAssetApiObjectAttributeNames._X_EP_DEVP_DOMAIN_OWNING_ID_,
    value: 'unknown-id'
  },
  {
    name: EEpDevPManageAssetApiObjectAttributeNames._X_EP_DEVP_DOMAIN_SHARING_LIST_,
    value: "unknown-id-1.unknown-id-2"
  }
];
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

const NoResultPublishDestinationAttributesQuery: IEpSdkAttributesQuery = {
  AND: [
    {
      attributeName: CorrectPublishDestinationAttribute.name,
      comparisonOp: EEpSdkComparisonOps.IS_EQUAL,
      value: 'no-result-pub-dest',
    },
  ]
};

const CorrectOwningDomainIdAttributesQuery: IEpSdkAttributesQuery = {
  AND: [
    {
      attributeName: CorrectPublishDestinationAttribute.name,
      comparisonOp: EEpSdkComparisonOps.IS_EQUAL,
      value: CorrectPublishDestinationAttribute.value,
    },

    // correct domain id

  //   OR: [
  //     {
  //       attributeName: EEpDevPManageAssetApiObjectAttributeNames._X_EP_DEVP_BUSINESS_GROUP_OWNING_ID_,
  //       comparisonOp: EEpSdkComparisonOps.IS_EQUAL,
  //       value: domainId
  //     },
  //     {
  //       attributeName: EEpDevPManageAssetApiObjectAttributeNames._X_EP_DEVP_BUSINESS_GROUP_SHARING_LIST_,
  //       comparisonOp: EEpSdkComparisonOps.CONTAINS,
  //       value: domainId
  //     },
  //   ]
  ]
};

const CorrectSharingDomainIdAttributesQuery: IEpSdkAttributesQuery = {
  AND: [
    {
      attributeName: CorrectPublishDestinationAttribute.name,
      comparisonOp: EEpSdkComparisonOps.IS_EQUAL,
      value: CorrectPublishDestinationAttribute.value,
    },

    // correct domain id in sharing

  //   OR: [
  //     {
  //       attributeName: EEpDevPManageAssetApiObjectAttributeNames._X_EP_DEVP_BUSINESS_GROUP_OWNING_ID_,
  //       comparisonOp: EEpSdkComparisonOps.IS_EQUAL,
  //       value: domainId
  //     },
  //     {
  //       attributeName: EEpDevPManageAssetApiObjectAttributeNames._X_EP_DEVP_BUSINESS_GROUP_SHARING_LIST_,
  //       comparisonOp: EEpSdkComparisonOps.CONTAINS,
  //       value: domainId
  //     },
  //   ]
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

    it(`${scriptName}: should create all eventApiProducts with 1 version, half of them with a plan, of which half have correct domain attributes`, async () => {
      try {
        // create the products
        const eventApiProductNameList = getEventApiProductNameList();
        let i = 0;
        let withPlan_i = 0;
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
          const withPlan: boolean = (i/2) % 2 === 0;
          const x = await EventApiProductsService.createEventApiProductVersion({
            requestBody: {
              eventApiProductId: eventApiProductResponse.data.id,
              version: '1.0.0',
              plans: withPlan ? [EventApiProductVersionPlan_1] : undefined,
            }
          });
          // set correct domain on half the ones withPlan
          if(withPlan) {
            if(withPlan_i % 2 === 0) {
              // add correct domains
              const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
                eventApiProductId: eventApiProductResponse.data.id,
                epSdkCustomAttributeList: CorrectDomainCustomAttributeList,
              });    
            } else {
              // add unknown domains
              const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
                eventApiProductId: eventApiProductResponse.data.id,
                epSdkCustomAttributeList: UnknownDomainCustomAttributeList,
              });    
            }
          }
          if(withPlan) withPlan_i++;
          i++;
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

    it(`${scriptName}: should get filtered list of latest event api product versions for correct publish destination`, async () => {
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

    it(`${scriptName}: should list latest versions, filters=none`, async () => {
      try {
        const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse = await EpSdkEventApiProductVersionsService.listLatestVersions({
          applicationDomainIds: [ApplicationDomainId],
          shared: true,
          brokerType: EpSdkBrokerTypes.Solace,
          objectAttributesQuery: undefined,
          withAtLeastOnePlan: false,
          withAtLeastOneAMessagingService: false,
          pageSize: 100,
        });
        // // DEBUG
        // expect(false, `epSdkEventApiProductAndVersionListResponse=${JSON.stringify(epSdkEventApiProductAndVersionListResponse, null, 2)}`).to.be.true;
        expect(epSdkEventApiProductAndVersionListResponse.data.length, 'wrong length').to.equal(NumEventApiProducts);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should list latest versions (filters=PubDest)`, async () => {
      try {
        const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse = await EpSdkEventApiProductVersionsService.listLatestVersions({
          applicationDomainIds: [ApplicationDomainId],
          shared: true,
          brokerType: EpSdkBrokerTypes.Solace,
          objectAttributesQuery: PublishDestinationAttributesQuery,
          withAtLeastOnePlan: false,
          withAtLeastOneAMessagingService: false,
          pageSize: 100,
        });
        // // DEBUG
        // expect(false, `epSdkEventApiProductAndVersionListResponse=${JSON.stringify(epSdkEventApiProductAndVersionListResponse, null, 2)}`).to.be.true;
        expect(epSdkEventApiProductAndVersionListResponse.data.length, 'wrong length').to.equal(NumEventApiProducts/2);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should list latest versions (filters=PubDest, withPlan)`, async () => {
      try {
        const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse = await EpSdkEventApiProductVersionsService.listLatestVersions({
          applicationDomainIds: [ApplicationDomainId],
          shared: true,
          brokerType: EpSdkBrokerTypes.Solace,
          objectAttributesQuery: PublishDestinationAttributesQuery,
          withAtLeastOnePlan: true,
          withAtLeastOneAMessagingService: false,
          pageSize: 100,
        });
        // // DEBUG
        // expect(false, `epSdkEventApiProductAndVersionListResponse=${JSON.stringify(epSdkEventApiProductAndVersionListResponse, null, 2)}`).to.be.true;
        expect(epSdkEventApiProductAndVersionListResponse.data.length, 'wrong length').to.equal(NumEventApiProducts/2/2);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    xit(`${scriptName}: should list latest versions (filters=PubDest, withPlan, correct domainId)`, async () => {
      try {
        const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse = await EpSdkEventApiProductVersionsService.listLatestVersions({
          applicationDomainIds: [ApplicationDomainId],
          shared: true,
          brokerType: EpSdkBrokerTypes.Solace,
          objectAttributesQuery: CorrectOwningDomainIdAttributesQuery,
          withAtLeastOnePlan: true,
          withAtLeastOneAMessagingService: false,
          pageSize: 100,
        });
        // // DEBUG
        // expect(false, `epSdkEventApiProductAndVersionListResponse=${JSON.stringify(epSdkEventApiProductAndVersionListResponse, null, 2)}`).to.be.true;
        expect(epSdkEventApiProductAndVersionListResponse.data.length, 'wrong length').to.equal(NumEventApiProducts/2/2/2);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    xit(`${scriptName}: should list latest versions (filters=PubDest, withPlan, correct domain sharing)`, async () => {
      try {
        const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse = await EpSdkEventApiProductVersionsService.listLatestVersions({
          applicationDomainIds: [ApplicationDomainId],
          shared: true,
          brokerType: EpSdkBrokerTypes.Solace,
          objectAttributesQuery: CorrectSharingDomainIdAttributesQuery,
          withAtLeastOnePlan: true,
          withAtLeastOneAMessagingService: false,
          pageSize: 100,
        });
        // // DEBUG
        // expect(false, `epSdkEventApiProductAndVersionListResponse=${JSON.stringify(epSdkEventApiProductAndVersionListResponse, null, 2)}`).to.be.true;
        expect(epSdkEventApiProductAndVersionListResponse.data.length, 'wrong length').to.equal(NumEventApiProducts/2/2/2);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should list latest versions with empty list result`, async () => {
      try {
        const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse = await EpSdkEventApiProductVersionsService.listLatestVersions({
          applicationDomainIds: [ApplicationDomainId],
          shared: true,
          brokerType: EpSdkBrokerTypes.Solace,
          objectAttributesQuery: NoResultPublishDestinationAttributesQuery,
          withAtLeastOnePlan: true,
          withAtLeastOneAMessagingService: false,
          pageSize: 100,
        });
        // // DEBUG
        // expect(false, `epSdkEventApiProductAndVersionListResponse=${JSON.stringify(epSdkEventApiProductAndVersionListResponse, null, 2)}`).to.be.true;
        expect(epSdkEventApiProductAndVersionListResponse.data.length, 'wrong length').to.equal(0);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

});

