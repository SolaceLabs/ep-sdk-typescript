import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';
import { TestUtils } from '../../lib/TestUtils';
import { 
  ApiError, 
  EventApiProductsResponse,
} from '@solace-labs/ep-apim-openapi-node';
import { 
  EpSdkError,
  EpSdkApimEventApiProductsService,
  EpSdkBrokerTypes,
  EpSdkApimEventApiProductQueryFields,
  EpSdkUtils,
  EpSdkBooleanTypes,
  TEpSdkCustomAttribute,
  EpSdkApplicationDomainsService
} from '../../../src';
import builder from '@rsql/builder';
import { emit } from '@rsql/emitter';
import { ApplicationDomainResponse, ApplicationDomainsService } from '@solace-labs/ep-openapi-node';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecName = "apim-eap-spec";
const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/${scriptName}/${TestSpecId}`;
let ApplicationDomainId: string | undefined;

// const NumEventApiProducts = 6; // divided by 3 = even number
// const getEventApiProductNameList = (): Array<string> => {
//   const list: Array<string> = [];;
//   for(let i=0; i < NumEventApiProducts; i++) {
//     list.push(i.toString());
//   }
//   return list;
// }
// let EventApiProductIdList: Array<string> = [];

const PublishDestinationsAttribute: TEpSdkCustomAttribute = {
  name: `${TestSpecName}-PUB_DESTS`,
  value: "ep-developer-portal"
};
const FlatImportAttribute: TEpSdkCustomAttribute = {
  name: `${TestSpecName}-FLAT_IMPORTS`,
  value: "true"
};
const XOwningDomainIdAttribute: TEpSdkCustomAttribute = {
  name: `${TestSpecName}-OwnDomainId`,
  value: "owning-domain-id"
};
const XSharingDomainIdAttribute: TEpSdkCustomAttribute = {
  name: `${TestSpecName}-SharingDomainId`,
  value: "sharing-domain-id"
};
// const AnotherAttribute: TEpSdkCustomAttribute = {
//   name: `${TestSpecName}.another`,
//   value: "another value"
// };

// const EmptyPublishDestinationAttributesQuery: IEpSdkAttributesQuery = {
//   AND: {
//     queryList: [
//       {
//         attributeName: PublishDestinationsAttribute.name,
//         comparisonOp: EEpSdkComparisonOps.IS_EMPTY,
//         value: '',
//       },
//     ]  
//   }
// };

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    before(async() => {
      TestContext.newItId();
      const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
        requestBody: {
          name: ApplicationDomainName,
        }
      });
      ApplicationDomainId = applicationDomainResponse.data.id;
    });

    after(async() => {
      // delete application domain
      TestContext.newItId();
      await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
      // // remove all attribute definitions
      // const allAttributes = [PublishDestinationsAttribute, AnotherAttribute];
      // const xvoid: void = await EpSdkEventApiProductsService.removeAssociatedEntityTypeFromCustomAttributeDefinitions({
      //   customAttributeNames: allAttributes.map( (x) => {
      //     return x.name;
      //   })
      // });      
    });

    it(`${scriptName}: should list event api products with only 1 attribute`, async () => {
      try {

        // TODO: build query with attributes like so:

// customAttributes.name=‘apim-eap.spec.PUB_DEST’ AND customAttributes.value.contains=ep-developer-portal
// 14:30
// (customAttributes.name=‘apim-eap.spec.PUB_DEST’ AND customAttributes.value.contains=ep-developer-portal) OR (customAttributes.name=‘apim-eap.spec.ANDERERWERT’ AND customAttributes.value.contains=5)

        // TODO: build query with OR statements: businessGroup and businessGroupSharing


      // https://github.com/piotr-oles/rsql#readme
        const ast = builder.and(
          builder.in(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>('applicationDomainId'), [ApplicationDomainId]),
          builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>('brokerType'), EpSdkBrokerTypes.Solace),
          builder.and(
            builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.name"), PublishDestinationsAttribute.name),
            builder.comparison(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.value"), '=contains=', PublishDestinationsAttribute.value),                        
            builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.name"), FlatImportAttribute.name),
            builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.value"), FlatImportAttribute.value),                        
            builder.or(
              builder.and(
                builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.name"), XOwningDomainIdAttribute.name),
                builder.comparison(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.value"), '=contains=', XOwningDomainIdAttribute.value),                        
              ),
              builder.and(
                builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.name"), XSharingDomainIdAttribute.name),
                builder.comparison(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes.value"), '=contains=', XSharingDomainIdAttribute.value),                        
              ),
            )
          ),
          builder.in(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>('version.state'), ["RELEASED", "DEPRECATED", "RETIRED", "DELETED"])
        );

        const query = emit(ast);

        const eventApiProductsResponse: EventApiProductsResponse = await EpSdkApimEventApiProductsService.listAll({ query: query });

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    xit(`${scriptName}: should list event api products with only multiple or attributes`, async () => {
      try {

        // TODO: build query with OR statements: businessGroup and businessGroupSharing


      // https://github.com/piotr-oles/rsql#readme
        const ast = builder.and(
          builder.in(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>('applicationDomainId'), [ApplicationDomainId]),
          builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>('brokerType'), EpSdkBrokerTypes.Solace),
          // builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>('shared'), EpSdkBooleanTypes.True),
          // builder.comparison(`${EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>("customAttributes")}.${PublishDestinationsAttribute.name}`, '=contains=', PublishDestinationsAttribute.value),
          builder.eq(EpSdkUtils.nameOf<EpSdkApimEventApiProductQueryFields>('version.state'), "RELEASED")
        );

        const query = emit(ast);

        const eventApiProductsResponse: EventApiProductsResponse = await EpSdkApimEventApiProductsService.listAll({ query: query });

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });


    // it(`${scriptName}: should create eventApiProducts, half of which have Pub Dest attribute`, async () => {
    //   try {
    //     // create the products
    //     const eventApiProductNameList = getEventApiProductNameList();
    //     let i = 0;
    //     for(const eventApiProductName of eventApiProductNameList) {
    //       const eventApiProductResponse: EventApiProductResponse = await EventApiProductsService.createEventApiProduct({
    //         requestBody: {
    //           applicationDomainId: ApplicationDomainId,
    //           name: eventApiProductName,
    //           shared: true,
    //           brokerType: EventApiProduct.brokerType.SOLACE,
    //         }
    //       });
    //       EventApiProductIdList.push(eventApiProductResponse.data.id);
    //       // set the attribute on all third event api products
    //       if(i % 3 === 0) {
    //         const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
    //           eventApiProductId: eventApiProductResponse.data.id,
    //           epSdkCustomAttributeList: [PublishDestinationsAttribute, AnotherAttribute]
    //         });
    //         // test it is set
    //         expect(eventApiProduct.customAttributes).to.not.be.undefined;
    //         const found: CustomAttribute | undefined = eventApiProduct.customAttributes.find( (customAttribute: CustomAttribute) => {
    //           return customAttribute.customAttributeDefinitionName === PublishDestinationsAttribute.name;
    //         });
    //         expect(found, `eventApiProduct=${JSON.stringify(eventApiProduct, null, 2)}`).to.not.be.undefined;
    //       } else if(i % 3 === 1) {
    //         const eventApiProduct: EventApiProduct = await EpSdkEventApiProductsService.setCustomAttributes({
    //           eventApiProductId: eventApiProductResponse.data.id,
    //           epSdkCustomAttributeList: [AnotherAttribute]
    //         });
    //       } else {
    //         // no attributes
    //       }
    //       i++;
    //     }
    //   } catch(e) {
    //     if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
    //     expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    //     expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    //   }
    // });

    // it(`${scriptName}: should find all event api products without Pub Dest attribute `, async () => {
    //   try {
    //     const eventApiProductsResponse: EventApiProductsResponse = await EpSdkEventApiProductsService.listAll({
    //       applicationDomainIds: [ApplicationDomainId],
    //       shared: true,
    //       attributesQuery: EmptyPublishDestinationAttributesQuery
    //     });
    //     // // DEBUG
    //     // expect(false, `eventApiProductsResponse.data=${JSON.stringify(eventApiProductsResponse.data, null, 2)}`).to.be.true;
    //     expect(eventApiProductsResponse.data).to.not.be.undefined;
    //     expect(eventApiProductsResponse.data.length, `wrong length, eventApiProductsResponse.data=${JSON.stringify(eventApiProductsResponse.data, null, 2)}`).to.equal(NumEventApiProducts/3 * 2);
    //     for(const eventApiProduct of eventApiProductsResponse.data) {
    //       expect(eventApiProduct.customAttributes).to.not.be.undefined;
    //       const found: CustomAttribute | undefined = eventApiProduct.customAttributes.find( (customAttribute: CustomAttribute) => {
    //         return customAttribute.customAttributeDefinitionName === PublishDestinationsAttribute.name;
    //       });  
    //       expect(found, `eventApiProduct=${JSON.stringify(eventApiProduct, null, 2)}`).to.be.undefined;
    //     }
    //   } catch(e) {
    //     if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
    //     expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    //     expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    //   }
    // });



});

