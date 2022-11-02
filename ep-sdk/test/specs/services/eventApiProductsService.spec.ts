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
  EventApiProductsResponse,
  EventApiProduct,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkError,
  EpSdkApplicationDomainsService,
  EpSdkEventApiProductsService,
  EpSdkEventApiProductVersionsService,
  EpSdkEventApiProductAndVersionList,
  EpSdkEventApiProductAndVersionListResponse,
  EpSdkEventApiProductAndVersionResponse,
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const NumApplicationDomains = 2;
const getApplicationDomainNameList = (): Array<string> => {
  const list: Array<string> = [];;
  for(let i=0; i < NumApplicationDomains; i++) {
    list.push(`${TestConfig.getAppId()}/${scriptName}/${TestSpecId}/${i}`);
  }
  return list;
}
let ApplicationDomainIdList: Array<string> = [];

const EventApiProductName = `${TestConfig.getAppId()}-eap-${TestSpecId}`;
const EventApiProductShared = true;
// let EventApiProductId: string | undefined;
const EventApiProductVersionString_1 = "1.0.0";
const EventApiProductVersionString_2 = "1.1.0";

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    before(async() => {
      // create all application domains
      const applicationDomainNameList = getApplicationDomainNameList();
      for(const applicationDomainName of applicationDomainNameList) {
        const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
          requestBody: {
            name: applicationDomainName,
          }
        });
        ApplicationDomainIdList.push(applicationDomainResponse.data.id);
      }
    });
  
    after(async() => {
      // delete all application domains
      // TODO: wait for EP to allow deletion of app domains which still contain event api products
      for(const applicationDomainId of ApplicationDomainIdList) {
        // delete all event api products first, restriction in EP at the moment
        const eventApiProductsResponse: EventApiProductsResponse = await EventApiProductsService.getEventApiProducts({
          applicationDomainId: applicationDomainId
        });
        for(const eventApiProduct of eventApiProductsResponse.data) {
          await EventApiProductsService.deleteEventApiProduct({
            id: eventApiProduct.id
          });
        }
        await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: applicationDomainId });
      }
    });

    it(`${scriptName}: should create eventApiProduct & two versions in every application domain`, async () => {
      try {
        for(const applicationDomainId of ApplicationDomainIdList) {
          // create the product
          const eventApiProductResponse: EventApiProductResponse = await EventApiProductsService.createEventApiProduct({
            requestBody: {
              applicationDomainId: applicationDomainId,
              name: EventApiProductName,
              shared: EventApiProductShared,
              brokerType: EventApiProduct.brokerType.SOLACE
            }
          });
          const eventApiProductId = eventApiProductResponse.data.id;
          // create version 1
          const x = await EventApiProductsService.createEventApiProductVersion({
            requestBody: {
              eventApiProductId: eventApiProductId,
              version: EventApiProductVersionString_1
            }
          });
          // const x = await EventApiProductsService.createEventApiProductVersionForEventApiProduct({
          //   eventApiProductId: eventApiProductId,
          //   requestBody: {
          //     version: EventApiProductVersionString_1
          //   }
          // });
          // create version 2
          const y = await EventApiProductsService.createEventApiProductVersion({
            requestBody: {
              eventApiProductId: eventApiProductId,
              version: EventApiProductVersionString_2
            }
          });
          // const y = await EventApiProductsService.createEventApiProductVersionForEventApiProduct({
          //   eventApiProductId: eventApiProductId,
          //   requestBody: {
          //     version: EventApiProductVersionString_2
          //   }
          // });
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get complete list of event api products`, async () => {
      try {
        const eventApiProductsResponse: EventApiProductsResponse = await EpSdkEventApiProductsService.listAll({
          applicationDomainIds: ApplicationDomainIdList,
          shared: EventApiProductShared,
        });
        expect(eventApiProductsResponse.data.length, TestLogger.createApiTestFailMessage('eventApi === undefined')).to.equal(NumApplicationDomains);
        expect(eventApiProductsResponse.meta.pagination.count, TestLogger.createApiTestFailMessage('eventApi === undefined')).to.equal(NumApplicationDomains);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get complete list of latest event api product versions`, async () => {
      try {
        const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse = await EpSdkEventApiProductVersionsService.listLatestVersions({
          applicationDomainIds: ApplicationDomainIdList,
          shared: true,
          pageNumber: 1,
          pageSize: 100
        });
        const epSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = epSdkEventApiProductAndVersionListResponse.data;

        const message = `epSdkEventApiProductAndVersionList=\n${JSON.stringify(epSdkEventApiProductAndVersionList, null, 2)}`;        
        expect(epSdkEventApiProductAndVersionList.length, message).to.equal(NumApplicationDomains);
        expect(epSdkEventApiProductAndVersionListResponse.meta.pagination.count, message).to.equal(NumApplicationDomains);
        for(const epSdkEventApiProductAndVersion of epSdkEventApiProductAndVersionList) {
          expect(epSdkEventApiProductAndVersion.eventApiProductVersion.version, TestLogger.createApiTestFailMessage('wrong version')).to.equal(EventApiProductVersionString_2);
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should test paging of latest event api product versions`, async () => {
      const PageSize = 1;
      let nextPage: number | undefined | null = 1;
      try {
        while(nextPage !== undefined && nextPage !== null) {
          const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse = await EpSdkEventApiProductVersionsService.listLatestVersions({
            applicationDomainIds: ApplicationDomainIdList,
            shared: true,
            pageNumber: nextPage,
            pageSize: PageSize
          });
          const epSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = epSdkEventApiProductAndVersionListResponse.data;
  
          const message = `epSdkEventApiProductAndVersionListResponse=\n${JSON.stringify(epSdkEventApiProductAndVersionListResponse, null, 2)}`;        
          expect(epSdkEventApiProductAndVersionList.length, message).to.equal(PageSize);
          expect(epSdkEventApiProductAndVersionListResponse.meta.pagination.count, message).to.equal(NumApplicationDomains);
          if(nextPage < NumApplicationDomains) {
            expect(epSdkEventApiProductAndVersionListResponse.meta.pagination.nextPage, message).to.equal(nextPage + 1);
          } else {
            expect(epSdkEventApiProductAndVersionListResponse.meta.pagination.nextPage, message).to.be.undefined;
          }
          for(const epSdkEventApiProductAndVersion of epSdkEventApiProductAndVersionList) {
            expect(epSdkEventApiProductAndVersion.eventApiProductVersion.version, TestLogger.createApiTestFailMessage('wrong version')).to.equal(EventApiProductVersionString_2);
          }
          nextPage = epSdkEventApiProductAndVersionListResponse.meta.pagination.nextPage;  
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get complete list of latest event api product versions for any application domain`, async () => {
      try {
        const epSdkEventApiProductAndVersionListResponse: EpSdkEventApiProductAndVersionListResponse = await EpSdkEventApiProductVersionsService.listLatestVersions({
          applicationDomainIds: ApplicationDomainIdList,
          shared: true,
          pageNumber: 1,
          pageSize: 100
        });
        const epSdkEventApiProductAndVersionList: EpSdkEventApiProductAndVersionList = epSdkEventApiProductAndVersionListResponse.data;
        expect(epSdkEventApiProductAndVersionList.length, TestLogger.createApiTestFailMessage('no versions found')).to.be.greaterThan(0);
        const message = TestLogger.createLogMessage('epSdkEventApiProductAndVersionList', epSdkEventApiProductAndVersionList);
        TestLogger.logMessageWithId(message);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get the latest version of for all event api products`, async () => {
      try {
        const eventApiProductsResponse: EventApiProductsResponse = await EpSdkEventApiProductsService.listAll({
          applicationDomainIds: ApplicationDomainIdList,
          shared: EventApiProductShared,
        });
        let message = `eventApiProductsResponse=\n${JSON.stringify(eventApiProductsResponse, null, 2)}`;        
        expect(eventApiProductsResponse.data, message).to.not.be.undefined;
        expect(eventApiProductsResponse.data.length, message).to.equal(NumApplicationDomains);
        for(const eventApiProduct of eventApiProductsResponse.data) {
          // get the latest version for each event api product
          const latest_EpSdkEventApiProductAndVersionResponse: EpSdkEventApiProductAndVersionResponse = await EpSdkEventApiProductVersionsService.getVersionForEventApiProductId({ 
            eventApiProductId: eventApiProduct.id,
            stateId: undefined
          });
          message = `latest_EpSdkEventApiProductAndVersionResponse=\n${JSON.stringify(latest_EpSdkEventApiProductAndVersionResponse, null, 2)}`;    
          expect(latest_EpSdkEventApiProductAndVersionResponse.eventApiProduct.id, message).to.equal(eventApiProduct.id);
          expect(latest_EpSdkEventApiProductAndVersionResponse.eventApiProductVersion.version, message).to.equal(EventApiProductVersionString_2);
          expect(JSON.stringify(latest_EpSdkEventApiProductAndVersionResponse.meta.versionStringList), message).to.include(EventApiProductVersionString_1);    
          expect(JSON.stringify(latest_EpSdkEventApiProductAndVersionResponse.meta.versionStringList), message).to.include(EventApiProductVersionString_2);    
          // get the version 1 for each event api product
          const version1_EpSdkEventApiProductAndVersionResponse: EpSdkEventApiProductAndVersionResponse = await EpSdkEventApiProductVersionsService.getVersionForEventApiProductId({ 
            eventApiProductId: eventApiProduct.id,
            stateId: undefined,
            versionString: EventApiProductVersionString_1
          });
          message = `version1_EpSdkEventApiProductAndVersionResponse=\n${JSON.stringify(version1_EpSdkEventApiProductAndVersionResponse, null, 2)}`;    
          expect(version1_EpSdkEventApiProductAndVersionResponse.eventApiProduct.id, message).to.equal(eventApiProduct.id);
          expect(version1_EpSdkEventApiProductAndVersionResponse.eventApiProductVersion.version, message).to.equal(EventApiProductVersionString_1);
          expect(JSON.stringify(version1_EpSdkEventApiProductAndVersionResponse.meta.versionStringList), message).to.include(EventApiProductVersionString_1);    
          expect(JSON.stringify(version1_EpSdkEventApiProductAndVersionResponse.meta.versionStringList), message).to.include(EventApiProductVersionString_2);    
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });


});

