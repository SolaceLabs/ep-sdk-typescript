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
  EventApiProductVersion,
} from '@solace-labs/ep-openapi-node';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EpSdkError } from '../../../src/utils/EpSdkErrors';
import EpSdkEventApiProductsService from '../../../src/services/EpSdkEventApiProductsService';
import EpSdkEventApiProductVersionsService from '../../../src/services/EpSdkEventApiProductVersionsService';
import { EpSdkBrokerType } from '../../../src/services/EpSdkService';
import EpSdkStatesService, { EEpSdkStateDTONames } from '../../../src/services/EpSdkStatesService';

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
      // for(const applicationDomainId of ApplicationDomainIdList) {
      //   await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: applicationDomainId });
      // }
    });

    it(`${scriptName}: should create eventApiProduct & two versions in every application domain`, async () => {
      try {
        for(const applicationDomainId of ApplicationDomainIdList) {
          // create the product
          const eventApiProductResponse: EventApiProductResponse = await EventApiProductsService.createEventApiProduct({
            requestBody: {
              applicationDomainId: applicationDomainId,
              name: EventApiProductName,
              shared: EventApiProductShared
            }
          });
          const eventApiProductId = eventApiProductResponse.data.id;
          // create version 1
          const x = await EventApiProductsService.createEventApiProductVersionForEventApiProduct({
            eventApiProductId: eventApiProductId,
            requestBody: {
              version: EventApiProductVersionString_1
            }
          });
          // create version 2
          const y = await EventApiProductsService.createEventApiProductVersionForEventApiProduct({
            eventApiProductId: eventApiProductId,
            requestBody: {
              version: EventApiProductVersionString_2
            }
          });
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
        const latest_eventApiProductVersionList: Array<EventApiProductVersion> = await EpSdkEventApiProductVersionsService.listAll_LatestVersions({
          applicationDomainIds: ApplicationDomainIdList,
          shared: EventApiProductShared,
          stateId: undefined
        });
        expect(latest_eventApiProductVersionList.length, TestLogger.createApiTestFailMessage('wrong number')).to.equal(NumApplicationDomains);
        for(const eventApiProductVersion of latest_eventApiProductVersionList) {
          expect(eventApiProductVersion.version, TestLogger.createApiTestFailMessage('wrong version')).to.equal(EventApiProductVersionString_2);
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get complete list of latest event api product versions for any application domain`, async () => {
      try {
        const latest_eventApiProductVersionList: Array<EventApiProductVersion> = await EpSdkEventApiProductVersionsService.listAll_LatestVersions({
          applicationDomainIds: undefined,
          shared: true,
          stateId: EpSdkStatesService.getEpStateIdByName({ epSdkStateDTOName: EEpSdkStateDTONames.RELEASED }),    
          // stateId: undefined
        });
        expect(latest_eventApiProductVersionList.length, TestLogger.createApiTestFailMessage('no versions found')).to.be.greaterThan(0);
        const message = TestLogger.createLogMessage('latest_eventApiProductVersionList', latest_eventApiProductVersionList);
        TestLogger.logMessageWithId(message);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    xit(`${scriptName}: should test brokerType parameter`, async () => {
      try {
        const latest_eventApiProductVersionList: Array<EventApiProductVersion> = await EpSdkEventApiProductVersionsService.listAll_LatestVersions({
          applicationDomainIds: ApplicationDomainIdList,
          shared: EventApiProductShared,
          stateId: undefined,
          brokerType: EpSdkBrokerType.Solace,
        });
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

});

